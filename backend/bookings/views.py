from django.shortcuts import render
from rest_framework import viewsets, permissions
from .permissions import IsBookingOwner, IsBookingProvider, IsBookingOwnerProviderOrAdmin
from .models import Booking
from .serializers import BookingCreateSerializer, BookingReadSerializer


# Create your views here.
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related(
        'user',
        'service',
        'room_type',
        'seat_type',
        'service__city',
        'service__category',
        'service__provider'
    ).prefetch_related(
        'service__images'
    )

    serializer_class = BookingReadSerializer
    permission_classes = [permissions.IsAuthenticated, IsBookingOwnerProviderOrAdmin]

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
        if self.action in [
            'create',
            'update',
            'partial_update'
        ]:
            return BookingCreateSerializer

        return BookingReadSerializer
