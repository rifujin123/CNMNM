from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from bookings.models import Booking
from services.models import BaseService
from services.perms import IsApprovedProviderOrAdmin

from .serializers import (
    ProviderRevenueReadSerializer,
    ChatRoomReadSerializer,
)
from bookings.serializers import RevenueStatsSerializer, ServiceStatsSerializer
from .models import ChatRoom


# UC11 - Revenue statistics
class ProviderStatsViewSet(GenericViewSet):
    permission_classes = [IsApprovedProviderOrAdmin]

    @action(detail=False, methods=['get'], url_path='revenue')
    def revenue(self, request):
        user = request.user
        period = request.query_params.get('period', 'month')
        now = timezone.now()

        if period == 'today':
            from_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            to_date = now
        elif period == 'week':
            from_date = now - timezone.timedelta(days=7)
            to_date = now
        elif period == 'month':
            from_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            to_date = now
        elif period == 'year':
            from_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            to_date = now
        else:
            return Response({'detail': 'Invalid period.'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = Booking.objects.filter(
            created_at__gte=from_date,
            created_at__lte=to_date,
            payments__payment_status='success',
        )

        if not user.is_staff:
            queryset = queryset.filter(service__provider=user)

        service_type = request.query_params.get('service_type')
        if service_type:
            queryset = queryset.filter(service__service_type=service_type)

        service_id = request.query_params.get('service_id')
        if service_id:
            queryset = queryset.filter(service_id=service_id)

        total_revenue = queryset.aggregate(total=Sum('total_price'))['total'] or 0
        total_bookings = queryset.count()
        avg_per_booking = total_revenue / total_bookings if total_bookings > 0 else 0

        by_type = []
        for st in ['tour', 'hotel', 'transport']:
            type_qs = queryset.filter(service__service_type=st)
            by_type.append({
                'type': st,
                'revenue': type_qs.aggregate(total=Sum('total_price'))['total'] or 0,
                'bookings': type_qs.count(),
            })

        top_services = list(
            queryset.values('service__name', 'service__id')
            .annotate(revenue=Sum('total_price'), bookings=Count('id'))
            .order_by('-revenue')[:10]
        )

        trunc = TruncMonth if period == 'year' else TruncDate
        date_field = 'created_at'
        revenue_series = [
            {
                'date': item['period_date'].isoformat(),
                'label': item['period_date'].strftime('%b' if period == 'year' else '%d/%m'),
                'value': item['value'] or 0,
            }
            for item in (
                queryset.annotate(period_date=trunc(date_field))
                .values('period_date')
                .annotate(value=Sum('total_price'))
                .order_by('period_date')
            )
        ]

        data = {
            'summary': {
                'total_revenue': total_revenue,
                'total_bookings': total_bookings,
                'avg_per_booking': avg_per_booking,
                'from_date': from_date.isoformat(),
                'to_date': to_date.isoformat(),
            },
            'by_service_type': by_type,
            'top_services': top_services,
            'revenue_series': revenue_series,
        }
        return Response(RevenueStatsSerializer(data).data)

    @action(detail=False, methods=['get'], url_path=r'services/(?P<service_id>[^/.]+)')
    def service_stats(self, request, service_id=None):
        user = request.user
        service = BaseService.objects.filter(id=service_id).first()
        if not service:
            return Response({'detail': 'Service not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not user.is_staff and service.provider != user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        bookings = Booking.objects.filter(service=service, payments__payment_status='success')
        data = {
            'service': service,
            'total_bookings': bookings.count(),
            'total_revenue': bookings.aggregate(total=Sum('total_price'))['total'] or 0,
            'avg_rating': 0,
        }
        return Response(ServiceStatsSerializer(data).data)


# UC12 - Chat with customer (messages via Firebase)
class ChatViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='')
    def list_rooms(self, request):
        user = request.user
        if user.is_provider:
            rooms = ChatRoom.objects.filter(provider=user).order_by('-created_at')
        else:
            rooms = ChatRoom.objects.filter(customer=user).order_by('-created_at')
        return Response(ChatRoomReadSerializer(rooms, many=True).data)

    @action(detail=False, methods=['post'], url_path='')
    def create_room(self, request):
        customer_id = request.data.get('customer_id') if request.user.is_provider else request.user.id
        provider_id = request.user.id if request.user.is_provider else request.data.get('provider_id')
        if not provider_id or not customer_id:
            return Response({'detail': 'provider_id and customer_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
        from accounts.models import User
        if not User.objects.filter(id=provider_id, is_provider=True).exists():
            return Response({'detail': 'Provider not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not User.objects.filter(id=customer_id, is_customer=True).exists():
            return Response({'detail': 'Customer not found.'}, status=status.HTTP_404_NOT_FOUND)
        room, created = ChatRoom.objects.get_or_create(
            provider_id=provider_id, customer_id=customer_id,
            defaults={
                'booking_id': request.data.get('booking_id'),
                'firebase_key': f"{provider_id}_{customer_id}",
            },
        )
        return Response(ChatRoomReadSerializer(room).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)