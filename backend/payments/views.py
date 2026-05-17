from rest_framework import status, viewsets, permissions, mixins
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentReadSerializer, PaymentCreateSerializer
from .payServices.payment_service import complete_static_qr_payment, expire_payment
from rest_framework.decorators import action
from django.utils import timezone



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
        if (
            payment.expires_at
            and payment.expires_at <= timezone.now()
            and payment.payment_status in Payment.active_statuses()
        ):
            return expire_payment(payment)

        return payment
    
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

