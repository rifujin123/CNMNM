from rest_framework import viewsets, permissions, mixins, status
from .permissions import IsBookingOwnerProviderOrAdmin,IsBookingCustomerOrAdmin,IsBookingOwnerOrAdmin,IsBookingProviderOwnerOrAdmin
from .models import Booking
from .serializers import BookingCreateSerializer, BookingReadSerializer
from bookings.services import BookingService
from rest_framework.response import Response
from rest_framework.decorators import action
from .pagination import BookingLimitOffsetPagination


class BookingViewSet(mixins.ListModelMixin, 
                     mixins.RetrieveModelMixin, 
                     mixins.CreateModelMixin, 
                     viewsets.GenericViewSet):
    
    queryset = Booking.objects.select_related(
        'user',
        'service',
        'room_type',
        'seat_type',
        'tour_package',
        'route',
        'route__from_city',
        'route__to_city',
        'service__city',
        'service__category',
        'service__provider',
    ).prefetch_related(
        'service__images',
        'rooms',
        'rooms__hotel',
        'rooms__room_type',
        'seat_statuses',
        'seat_statuses__physical_seat',
        'seat_statuses__physical_seat__seat_type',
    )

    serializer_class = BookingReadSerializer
    pagination_class = BookingLimitOffsetPagination

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            queryset = self.queryset

        elif user.is_provider and user.is_approved:
            queryset = self.queryset.filter(
                service__provider_id=user.id
            )

        elif user.is_customer:
            queryset = self.queryset.filter(
                user_id=user.id
            )

        else:
            return Booking.objects.none()

        params = self.request.query_params

        booking_status = params.get("booking_status")
        if booking_status:
            queryset = queryset.filter(booking_status=booking_status)

        service_id = params.get("service")
        if service_id:
            queryset = queryset.filter(service_id=service_id)

        service_type = params.get("service_type")

        if service_type == "tour":
            queryset = queryset.filter(service__traveltour__isnull=False)

        elif service_type == "hotel":
            queryset = queryset.filter(service__hotel__isnull=False)

        elif service_type == "transport":
            queryset = queryset.filter(service__transport__isnull=False)

        from_date = params.get("from_date")
        if from_date:
            queryset = queryset.filter(created_date__date__gte=from_date)

        to_date = params.get("to_date")
        if to_date:
            queryset = queryset.filter(created_date__date__lte=to_date)

        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer

        return BookingReadSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsBookingCustomerOrAdmin]

        elif self.action == 'cancel':
            permission_classes = [permissions.IsAuthenticated, IsBookingOwnerOrAdmin]

        elif self.action == 'complete':
            permission_classes = [permissions.IsAuthenticated, IsBookingProviderOwnerOrAdmin]

        elif self.action == 'refund':
            permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

        else:
            permission_classes = [permissions.IsAuthenticated, IsBookingOwnerProviderOrAdmin]

        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        booking = BookingService.cancel_booking(booking)
        serializer = BookingReadSerializer(
            booking,
            context=self.get_serializer_context()
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        booking = self.get_object()
        booking = BookingService.complete_booking(booking)
        serializer = BookingReadSerializer(
            booking,
            context=self.get_serializer_context()
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        booking = self.get_object()
        booking = BookingService.refund_booking(booking)
        serializer = BookingReadSerializer(
            booking,
            context=self.get_serializer_context()
        )

        return Response(serializer.data, status=status.HTTP_200_OK)