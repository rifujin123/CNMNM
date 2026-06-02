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
        queryset = BookingService.get_queryset_for_user(self.queryset, self.request.user)

        return BookingService.apply_query_filters(queryset, self.request.query_params)
    

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
    

    def list(self, request, *args, **kwargs):
        role_queryset = BookingService.get_queryset_for_user(
            self.queryset,
            request.user
        )

        BookingService.expire_overdue_bookings(role_queryset)

        queryset = self.filter_queryset(
            self.get_queryset()
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True
            )
            return self.get_paginated_response(
                serializer.data
            )

        serializer = self.get_serializer(
            queryset,
            many=True
        )
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        booking = BookingService.cancel_booking(booking)
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        booking = self.get_object()
        booking = BookingService.complete_booking(booking)
        serializer = self.get_serializer(booking)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        booking = self.get_object()
        booking = BookingService.refund_booking(booking)
        serializer = self.get_serializer(booking)

        return Response(serializer.data, status=status.HTTP_200_OK)
