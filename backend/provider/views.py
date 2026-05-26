from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from bookings.models import Booking
from services.models import BaseService, TravelTour, Hotel, Transport
from services.perms import IsApprovedProviderOrAdmin

from .serializers import RevenueStatsSerializer, ServiceStatsSerializer


class ProviderStatsViewSet(viewsets.ViewSet):
    permission_classes = [IsApprovedProviderOrAdmin]

    @action(detail=False, methods=["get"], url_path="revenue")
    def revenue(self, request):
        user = request.user

        period = request.query_params.get("period", "month")
        now = timezone.now()

        if period == "today":
            from_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            to_date = now

        elif period == "week":
            from_date = now - timezone.timedelta(days=7)
            to_date = now

        elif period == "month":
            from_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            to_date = now

        elif period == "year":
            from_date = now.replace(
                month=1, day=1, hour=0, minute=0, second=0, microsecond=0
            )
            to_date = now

        else:
            return Response(
                {"detail": "Invalid period"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = Booking.objects.filter(
            created_at__gte=from_date,
            created_at__lte=to_date,
            payment__payment_status="paid",
        )

        if not user.is_staff:
            queryset = queryset.filter(service__provider=user)

        service_type = request.query_params.get("service_type")
        if service_type:
            if service_type == "tour":
                queryset = queryset.filter(service__traveltour__isnull=False)
            elif service_type == "hotel":
                queryset = queryset.filter(service__hotel__isnull=False)
            elif service_type == "transport":
                queryset = queryset.filter(service__transport__isnull=False)

        service_id = request.query_params.get("service_id")
        if service_id:
            queryset = queryset.filter(service_id=service_id)

        total_revenue = queryset.aggregate(total=Sum("total_price"))["total"] or 0
        total_bookings = queryset.count()
        avg_per_booking = total_revenue / total_bookings if total_bookings > 0 else 0

        by_type = []

        tour_queryset = queryset.filter(service__traveltour__isnull=False)
        tour_revenue = tour_queryset.aggregate(total=Sum("total_price"))["total"] or 0
        by_type.append(
            {
                "type": "tour",
                "revenue": tour_revenue,
                "bookings": tour_queryset.count(),
            }
        )

        hotel_queryset = queryset.filter(service__hotel__isnull=False)
        hotel_revenue = hotel_queryset.aggregate(total=Sum("total_price"))["total"] or 0
        by_type.append(
            {
                "type": "hotel",
                "revenue": hotel_revenue,
                "bookings": hotel_queryset.count(),
            }
        )

        transport_queryset = queryset.filter(service__transport__isnull=False)
        transport_revenue = (
            transport_queryset.aggregate(total=Sum("total_price"))["total"] or 0
        )
        by_type.append(
            {
                "type": "transport",
                "revenue": transport_revenue,
                "bookings": transport_queryset.count(),
            }
        )

        top_services = (
            queryset.values("service__name", "service__id")
            .annotate(revenue=Sum("total_price"), bookings=Count("id"))
            .order_by("-revenue")[:10]
        )

        data = {
            "summary": {
                "total_revenue": total_revenue,
                "total_bookings": total_bookings,
                "avg_per_booking": avg_per_booking,
                "from_date": from_date.isoformat(),
                "to_date": to_date.isoformat(),
            },
            "by_service_type": by_type,
            "top_services": list(top_services),
        }

        serializer = RevenueStatsSerializer(data)
        return Response(serializer.data)

    def _service_stats_response(self, request, service_id=None):
        user = request.user

        service = BaseService.objects.filter(id=service_id).first()
        if not service:
            return Response(
                {"detail": "Service not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.is_staff and service.provider != user:
            return Response(
                {"detail": "You don't have permission to view this service stats"},
                status=status.HTTP_403_FORBIDDEN,
            )

        bookings = Booking.objects.filter(
            service=service,
            payment__payment_status="paid",
        )

        total_bookings = bookings.count()
        total_revenue = bookings.aggregate(total=Sum("total_price"))["total"] or 0
        avg_rating = 0

        serializer = ServiceStatsSerializer(
            {
                "service": service,
                "total_bookings": total_bookings,
                "total_revenue": total_revenue,
                "avg_rating": avg_rating,
            }
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path=r"services/(?P<service_id>[^/.]+)")
    def service_stats(self, request, service_id=None):
        return self._service_stats_response(request, service_id=service_id)

    @action(detail=False, methods=["get"], url_path=r"services/(?P<service_id>[^/.]+)/stats")
    def service_stats_legacy(self, request, service_id=None):
        return self._service_stats_response(request, service_id=service_id)