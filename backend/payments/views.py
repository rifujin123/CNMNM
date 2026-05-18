from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Payment
from .payServices.payment_service import (
    PaymentLifecycleService,
    complete_static_qr_payment,
)
from .serializers import PaymentCreateSerializer, PaymentReadSerializer


class PaymentViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Payment.objects.select_related(
        "user",
        "booking",
        "booking__service",
        "booking__service__provider",
    )

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return self.queryset

        if user.is_provider and user.is_approved:
            return self.queryset.filter(booking__service__provider_id=user.id)

        if user.is_customer:
            return self.queryset.filter(user_id=user.id)

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
            return PaymentLifecycleService.expire_payment(payment)

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

        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "Chi admin moi co quyen xac nhan thanh toan Static QR."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if payment.payment_method != Payment.PaymentMethod.STATIC_QR:
            return Response(
                {"detail": "Chi thanh toan Static QR moi can xac nhan thu cong."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = complete_static_qr_payment(
            transaction_id=payment.transaction_id,
            provider_transaction_id=request.data.get("provider_transaction_id"),
            result=request.data.get("result", "success"),
        )

        serializer = PaymentReadSerializer(payment, context=self.get_serializer_context())
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        payment = self.get_object()

        if payment.user_id != request.user.id:
            return Response(
                {"detail": "Ban chi co the huy thanh toan cua chinh minh."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if payment.payment_status not in Payment.active_statuses():
            return Response(
                {"detail": "Thanh toan nay khong the huy."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if payment.payment_method != Payment.PaymentMethod.STATIC_QR:
            return Response(
                {"detail": "Thanh toan nay khong the huy tu man hinh nay."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = PaymentLifecycleService.cancel_payment(payment)

        serializer = self.get_serializer(payment)
        return Response(serializer.data, status=status.HTTP_200_OK)
