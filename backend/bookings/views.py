from rest_framework import viewsets, permissions, mixins, status
from .permissions import IsBookingOwnerProviderOrAdmin,IsBookingCustomerOrAdmin,IsBookingOwnerOrAdmin,IsBookingProviderOwnerOrAdmin
from .models import Booking
from .serializers import BookingCreateSerializer, BookingReadSerializer
from bookings.services import BookingService
from rest_framework.response import Response
from rest_framework.decorators import action

# Create your views here.
class BookingViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
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

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return self.queryset

        if user.is_provider and user.is_approved:
            return self.queryset.filter(
                service__provider_id=user.id
            )

        if user.is_customer:
            return self.queryset.filter(
                user_id=user.id
            )

        return Booking.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer

        return BookingReadSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = serializer.save()

        read_serializer = BookingReadSerializer(
            booking,
            context=self.get_serializer_context()
        )

        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsBookingCustomerOrAdmin]

        elif self.action == 'cancel':
            permission_classes = [permissions.IsAuthenticated, IsBookingOwnerOrAdmin]

        elif self.action == 'complete':
            permission_classes = [permissions.IsAuthenticated, IsBookingProviderOwnerOrAdmin]

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
    
    # @action(detail=True, methods=['post'])
    # def confirm(self, request, pk=None):
    #     booking = self.get_object()

    #     booking = BookingService.confirm_booking(booking)

    #     serializer = BookingReadSerializer(
    #         booking,
    #         context=self.get_serializer_context()
    #     )

    #     return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        booking = self.get_object()

        booking = BookingService.complete_booking(booking)

        serializer = BookingReadSerializer(
            booking,
            context=self.get_serializer_context()
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
