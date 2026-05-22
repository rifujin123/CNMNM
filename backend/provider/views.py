from decimal import Decimal

from django.contrib.contenttypes.models import ContentType
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from bookings.models import Booking
from services.models import BaseService, TravelTour, Hotel, Transport

from .serializers import RevenueStatsSerializer, ServiceStatsSerializer
from .perms import IsProviderOwner


class ProviderStatsViewSet(viewsets.ViewSet):
    permission_classes = [IsProviderOwner]

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
            from_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            to_date = now
        else:
            return Response(
                {"detail": "Invalid period"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = Booking.objects.filter(
            created_date__gte=from_date,
            created_date__lte=to_date,
            payment_status=Booking.PaymentStatus.PAID,
        )

        if not user.is_staff:
            queryset = queryset.filter(service__provider=user)

        service_type = request.query_params.get("service_type")
        if service_type == "tour":
            queryset = queryset.filter(service__traveltour__isnull=False)
        elif service_type == "hotel":
            queryset = queryset.filter(service__hotel__isnull=False)
        elif service_type == "transport":
            queryset = queryset.filter(service__transport__isnull=False)

        service_id = request.query_params.get("service_id")
        if service_id:
            queryset = queryset.filter(service_id=service_id)

        total_revenue = queryset.aggregate(total=Sum("total_price"))["total"] or Decimal("0")
        total_bookings = queryset.count()
        avg_per_booking = (
            total_revenue / total_bookings if total_bookings > 0 else Decimal("0")
        )

        by_type = []
        for type_name, model_class in [
            ("tour", TravelTour),
            ("hotel", Hotel),
            ("transport", Transport),
        ]:
            type_queryset = queryset.filter(
                service__polymorphic_ctype_id=ContentType.objects.get_for_model(model_class).id
            )
            type_revenue = type_queryset.aggregate(total=Sum("total_price"))["total"] or Decimal("0")
            type_bookings = type_queryset.count()
            by_type.append(
                {
                    "type": type_name,
                    "revenue": type_revenue,
                    "bookings": type_bookings,
                    "percent": float(type_bookings / total_bookings * 100) if total_bookings else 0,
                }
            )

        top_services = list(
            queryset.values("service__name", "service__id")
            .annotate(revenue=Sum("total_price"), bookings=Count("id"))
            .order_by("-revenue")[:10]
        )

        revenue_series = []
        if period == "year":
            revenue_map = {
                (item["bucket"].date() if hasattr(item["bucket"], "date") else item["bucket"]): item["revenue"] or Decimal("0")
                for item in queryset.annotate(bucket=TruncMonth("created_date"))
                .values("bucket")
                .annotate(revenue=Sum("total_price"))
                .order_by("bucket")
            }

            current = from_date.replace(day=1)
            while current <= to_date:
                revenue_series.append(
                    {
                        "date": current.date().isoformat(),
                        "label": current.strftime("%m/%y"),
                        "value": revenue_map.get(current.date(), Decimal("0")),
                    }
                )
                if current.month == 12:
                    current = current.replace(year=current.year + 1, month=1)
                else:
                    current = current.replace(month=current.month + 1)
        else:
            revenue_map = {
                item["bucket"]: item["revenue"] or Decimal("0")
                for item in queryset.annotate(bucket=TruncDate("created_date"))
                .values("bucket")
                .annotate(revenue=Sum("total_price"))
                .order_by("bucket")
            }

            current = from_date.date()
            end_date = to_date.date()
            while current <= end_date:
                revenue_series.append(
                    {
                        "date": current.isoformat(),
                        "label": current.strftime("%d/%m"),
                        "value": revenue_map.get(current, Decimal("0")),
                    }
                )
                current += timezone.timedelta(days=1)

        serializer = RevenueStatsSerializer(
            {
                "summary": {
                    "total_revenue": total_revenue,
                    "total_bookings": total_bookings,
                    "avg_per_booking": avg_per_booking,
                    "from_date": from_date,
                    "to_date": to_date,
                },
                "by_service_type": by_type,
                "top_services": top_services,
                "revenue_series": revenue_series,
            }
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path=r"services/(?P<service_id>[^/.]+)/stats")
    def service_stats(self, request, service_id=None):
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
            payment_status=Booking.PaymentStatus.PAID,
        )
        total_bookings = bookings.count()
        total_revenue = bookings.aggregate(total=Sum("total_price"))["total"] or Decimal("0")
        avg_rating = Decimal(str(service.star_rating or 0))

        serializer = ServiceStatsSerializer(
            {
                "service": service,
                "total_bookings": total_bookings,
                "total_revenue": total_revenue,
                "avg_rating": avg_rating,
            }
        )
        return Response(serializer.data)
