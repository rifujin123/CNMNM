from rest_framework import status, viewsets, permissions, mixins
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentReadSerializer, PaymentCreateSerializer
from .payServices.payment_service import complete_static_qr_payment, PaymentLifecycleService
from rest_framework.decorators import action
from django.utils import timezone

from django.conf import settings
from django.shortcuts import redirect

from .payServices.momo_service import MoMoPaymentService
from .payServices.vnpay_service import VnPayPaymentService


class PaymentViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,mixins.RetrieveModelMixin,viewsets.GenericViewSet):
    queryset = Payment.objects.select_related(
        'user', 
        'booking',
        'booking__service',
        'booking__service__provider'
    )
    
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return self.queryset

        if user.is_provider and user.is_approved:
            return self.queryset.filter(
                booking__service__provider_id=user.id
            )

        if user.is_customer:
            return self.queryset.filter(
                user_id=user.id
            )

        return Payment.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentCreateSerializer

        return PaymentReadSerializer

    def _expire_payment_if_needed(self, payment):
        if (payment.expires_at
            and payment.expires_at <= timezone.now()
            and payment.payment_status in Payment.active_statuses()):
            return PaymentLifecycleService.expire_payment(payment)

        return payment
    
    def _build_payment_deep_link(self, payment):
        scheme = getattr(settings, "APP_DEEP_LINK_SCHEME", "travelbooking")
        return (
            f"{scheme}://payment-result"
            f"?payment_id={payment.id}"
            f"&booking_id={payment.booking_id}"
            f"&status={payment.payment_status}"
        )
    
    def retrieve(self, request, *args, **kwargs):
        payment = self.get_object()
        payment = self._expire_payment_if_needed(payment)

        serializer = self.get_serializer(payment)
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        for payment in queryset:
            self._expire_payment_if_needed(payment)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=True, methods=["post"], url_name="confirm-static-qr")
    def confirm_static_qr_payment(self, request, pk=None):
        payment = self.get_object()

        if not (
            request.user.is_staff
            or request.user.is_superuser
            or (
                request.user.is_provider
                and request.user.is_approved
                and payment.booking.service.provider_id == request.user.id
            )
            ):
            return Response(
                {"detail": "Bạn không có quyền xác nhận thanh toán này."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        provider_transaction_id = request.data.get("provider_transaction_id")
        result = request.data.get("result", "success")

        if payment.payment_method != Payment.PaymentMethod.STATIC_QR:
            return Response(
                {"detail": "Chỉ thanh toán Static QR mới cần xác nhận thủ công."},
                status=status.HTTP_400_BAD_REQUEST,)

        payment = complete_static_qr_payment(
            transaction_id=payment.transaction_id, 
            provider_transaction_id=provider_transaction_id, result=result)
        
        serializer = PaymentReadSerializer(payment, context=self.get_serializer_context())
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        payment = self.get_object()

        if payment.user_id != request.user.id:
            return Response(
                {"detail": "Bạn chỉ có thể hủy thanh toán của chính mình."},
                status = status.HTTP_403_FORBIDDEN,
            )
        if payment.payment_status not in Payment.active_statuses():
            return Response(
                {"detail": "Thanh toán này không thể hủy."},
                status = status.HTTP_400_BAD_REQUEST,
            )
        if payment.payment_method != Payment.PaymentMethod.STATIC_QR:
            return Response(
                {"detail": "Thanh toán cổng MoMo/VNPay cần hủy từ gateway hoặc chờ IPN."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        payment = PaymentLifecycleService.cancel_payment(payment)

        serializer = self.get_serializer(payment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

    @action(detail=False,methods=["post"],url_path="momo/ipn",permission_classes=[permissions.AllowAny],authentication_classes=[],)
    def momo_ipn(self, request):
        MoMoPaymentService.handle_ipn(request.data)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False,methods=["get"],url_path="momo/return",permission_classes=[permissions.AllowAny],authentication_classes=[],)
    def momo_return(self, request):
        payment = MoMoPaymentService.get_payment_from_return(request.query_params)
        return redirect(self._build_payment_deep_link(payment))
    
    @action(detail=False,methods=["get"],url_path="vnpay/ipn",permission_classes=[permissions.AllowAny],authentication_classes=[],)
    def vnpay_ipn(self, request):
        result = VnPayPaymentService.handle_ipn(request.query_params)
        return Response(result, status=status.HTTP_200_OK)
    
    @action(detail=False,methods=["get"],url_path="vnpay/return",permission_classes=[permissions.AllowAny],authentication_classes=[],)
    def vnpay_return(self, request):
        payment = VnPayPaymentService.get_payment_from_return(request.query_params)
        return redirect(self._build_payment_deep_link(payment))
    

            

