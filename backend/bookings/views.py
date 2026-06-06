from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView, GenericAPIView
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .models import Booking
from .permissions import (
    IsBookingOwnerOrAdmin,
    IsBookingCustomerOrAdmin,
    IsBookingOwnerProviderOrAdmin,
    IsBookingProviderOwnerOrAdmin,
)
from .serializers import (
    BookingReadSerializer,
    BookingWriteSerializer,
    BookingReviewReadSerializer,
    BookingReviewWriteSerializer,
)
from .services import BookingService
from .pagination import BookingLimitOffsetPagination


class BookingListCreateView(ListCreateAPIView):
    """UC17 Book service, UC19 Booking history."""

    queryset = Booking.objects.select_related(
        'user', 'service', 'service__city', 'service__category', 'service__provider',
    ).prefetch_related('items', 'review')

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated(), IsBookingOwnerProviderOrAdmin()]
        return [permissions.IsAuthenticated(), IsBookingCustomerOrAdmin()]

    def get_serializer_class(self):
        return BookingReadSerializer if self.request.method == 'GET' else BookingWriteSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            qs = super().get_queryset()
        elif user.is_provider and user.is_approved:
            qs = super().get_queryset().filter(service__provider_id=user.id)
        elif user.is_customer:
            qs = super().get_queryset().filter(user_id=user.id)
        else:
            return Booking.objects.none()

        # Expire overdue bookings
        overdue_ids = list(
            qs.filter(
                booking_status=Booking.BookingStatus.PENDING,
                payment_status=Booking.PaymentStatus.UNPAID,
                expires_at__isnull=False,
                expires_at__lte=timezone.now(),
            ).values_list('id', flat=True)
        )
        for booking in Booking.objects.filter(id__in=overdue_ids):
            BookingService.expire_booking(booking)

        # Filters
        params = self.request.query_params
        if params.get('booking_status'):
            qs = qs.filter(booking_status=params['booking_status'])
        if params.get('service'):
            qs = qs.filter(service_id=params['service'])
        if params.get('service_type'):
            qs = qs.filter(service__service_type=params['service_type'])
        if params.get('from_date'):
            qs = qs.filter(created_at__date__gte=params['from_date'])
        if params.get('to_date'):
            qs = qs.filter(created_at__date__lte=params['to_date'])
        return qs

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        paginator = BookingLimitOffsetPagination()
        page = paginator.paginate_queryset(qs, request)
        if page is not None:
            return paginator.get_paginated_response(BookingReadSerializer(page, many=True).data)
        return Response(BookingReadSerializer(qs, many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(BookingReadSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingDetailView(RetrieveAPIView):
    """UC15 View booking detail."""

    queryset = Booking.objects.select_related(
        'user', 'service', 'service__city', 'service__category', 'service__provider',
    ).prefetch_related('items', 'review')
    serializer_class = BookingReadSerializer
    permission_classes = [permissions.IsAuthenticated, IsBookingOwnerProviderOrAdmin]


# Custom actions: cancel, complete, refund, review
class BookingActionViewSet(GenericViewSet):
    """UC18 Cancel, UC20 Rate & review, complete, refund."""

    queryset = Booking.objects.select_related('user', 'service', 'service__provider')

    def get_permissions(self):
        if self.action == 'cancel':
            return [permissions.IsAuthenticated(), IsBookingOwnerOrAdmin()]
        if self.action == 'complete':
            return [permissions.IsAuthenticated(), IsBookingProviderOwnerOrAdmin()]
        if self.action == 'refund':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        if self.action == 'review':
            return [permissions.IsAuthenticated(), IsBookingOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    # UC18 - Cancel booking
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = BookingService.cancel_booking(self.get_object())
        return Response(BookingReadSerializer(booking).data, status=status.HTTP_200_OK)

    # Provider: complete booking
    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        booking = BookingService.complete_booking(self.get_object())
        return Response(BookingReadSerializer(booking).data, status=status.HTTP_200_OK)

    # Admin: refund booking
    @action(detail=True, methods=['post'], url_path='refund')
    def refund(self, request, pk=None):
        booking = BookingService.refund_booking(self.get_object())
        return Response(BookingReadSerializer(booking).data, status=status.HTTP_200_OK)

    # UC20 - Rate & review
    @action(detail=True, methods=['get', 'post'], url_path='review')
    def review(self, request, pk=None):
        booking = self.get_object()
        if request.method == 'GET':
            review = getattr(booking, 'review', None)
            if not review:
                return Response({'detail': 'No review yet.'}, status=status.HTTP_404_NOT_FOUND)
            return Response(BookingReviewReadSerializer(review).data)
        # POST
        if hasattr(booking, 'review'):
            return Response({'detail': 'Review already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = BookingReviewWriteSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, booking=booking)
        return Response(BookingReviewReadSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)