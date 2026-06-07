from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from .models import Payment
from .payServices.payment_service import PaymentLifecycleService, complete_static_qr_payment
from .serializers import PaymentReadSerializer, PaymentWriteSerializer, AdminDashboardSerializer
from .pagination import PaymentLimitOffsetPagination
from .dashboard_service import AdminDashboardService


class PaymentListCreateView(ListCreateAPIView):
    """UC23 Online payment, UC24 Cash payment, UC26 Transaction history."""

    queryset = Payment.objects.select_related(
        'user', 'booking', 'booking__service', 'booking__service__provider',
    )

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        return PaymentReadSerializer if self.request.method == 'GET' else PaymentWriteSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            qs = super().get_queryset()
        elif user.is_provider and user.is_approved:
            qs = super().get_queryset().filter(booking__service__provider_id=user.id)
        elif user.is_customer:
            qs = super().get_queryset().filter(user_id=user.id)
        else:
            return Payment.objects.none()

        # Expire overdue payments
        overdue_ids = list(
            qs.filter(
                payment_status__in=Payment.active_statuses(),
                expires_at__isnull=False,
                expires_at__lte=timezone.now(),
            ).values_list('id', flat=True)
        )
        for payment in Payment.objects.select_related('booking').filter(id__in=overdue_ids):
            PaymentLifecycleService.expire_payment(payment)

        # Filters
        params = self.request.query_params
        if params.get('payment_status'):
            qs = qs.filter(payment_status=params['payment_status'])
        if params.get('payment_method'):
            qs = qs.filter(payment_method=params['payment_method'])
        if params.get('booking'):
            qs = qs.filter(booking_id=params['booking'])
        if params.get('from_date'):
            qs = qs.filter(created_at__date__gte=params['from_date'])
        if params.get('to_date'):
            qs = qs.filter(created_at__date__lte=params['to_date'])
        return qs

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        paginator = PaymentLimitOffsetPagination()
        page = paginator.paginate_queryset(qs, request)
        if page is not None:
            return paginator.get_paginated_response(PaymentReadSerializer(page, many=True).data)
        return Response(PaymentReadSerializer(qs, many=True).data)


class PaymentDetailView(RetrieveAPIView):
    queryset = Payment.objects.select_related('user', 'booking', 'booking__service')
    serializer_class = PaymentReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        payment = self.get_object()
        # Check ownership
        user = request.user
        if not (user.is_staff or payment.user_id == user.id or
                (user.is_provider and payment.booking.service.provider_id == user.id)):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        # Expire if needed
        if (payment.expires_at and payment.expires_at <= timezone.now()
                and payment.payment_status in Payment.active_statuses()):
            payment = PaymentLifecycleService.expire_payment(payment)
        return Response(PaymentReadSerializer(payment).data)


# Custom actions: cancel, confirm
class PaymentActionViewSet(GenericViewSet):
    queryset = Payment.objects.select_related('user', 'booking', 'booking__service')

    # Customer: cancel payment
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        payment = self.get_object()
        if payment.user_id != request.user.id:
            return Response({'detail': 'You can only cancel your own payments.'}, status=status.HTTP_403_FORBIDDEN)
        if payment.payment_status not in Payment.active_statuses():
            return Response({'detail': 'Payment cannot be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        payment = PaymentLifecycleService.cancel_payment(payment)
        return Response(PaymentReadSerializer(payment).data, status=status.HTTP_200_OK)

    # Admin: confirm static QR payment
    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm(self, request, pk=None):
        payment = self.get_object()
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'Only admin can confirm payments.'}, status=status.HTTP_403_FORBIDDEN)
        if payment.payment_method != Payment.PaymentMethod.STATIC_QR:
            return Response({'detail': 'Only Static QR payments need manual confirmation.'}, status=status.HTTP_400_BAD_REQUEST)
        payment = complete_static_qr_payment(
            transaction_id=payment.transaction_id,
            provider_transaction_id=request.data.get('provider_transaction_id'),
            result=request.data.get('result', 'success'),
        )
        return Response(PaymentReadSerializer(payment).data, status=status.HTTP_200_OK)


# UC29 - Admin dashboard
class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = AdminDashboardService.get_admin_dashboard()
        return Response(AdminDashboardSerializer(data).data)