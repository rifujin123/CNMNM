from bookings.models import Booking
from payments.models import Payment
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from bookings.services import BookingService
from .static_qr_service import build_static_qr_metadata

class StaticQrPaymentService:
    def create_payment(self, payment, request):
        static_qr_metadata = build_static_qr_metadata(payment)

        payment.payment_status = Payment.PaymentStatus.PROCESSING
        payment.payment_url = static_qr_metadata["qr_url"]
        payment.metadata = {
            **(payment.metadata or {}),
            **static_qr_metadata,
        }
        payment.save(
            update_fields=[
                "payment_status",
                "payment_url",
                "metadata",
                "updated_at",
            ]
        )
        return payment

    def complete_payment(self, transaction_id, provider_transaction_id = None, result="success"):
        with transaction.atomic():
            payment = (Payment.objects
                       .select_for_update()
                       .select_related('booking')
                       .get(transaction_id=transaction_id))
            
            if (
            payment.expires_at
            and payment.expires_at <= timezone.now()
            and payment.payment_status in Payment.active_statuses()):
                self.mark_expired(payment)
                return payment

            if payment.payment_status in [
                Payment.PaymentStatus.SUCCESS,
                Payment.PaymentStatus.REFUNDED]:
                return payment
            if payment.payment_status in [
                Payment.PaymentStatus.CANCELLED,
                Payment.PaymentStatus.EXPIRED,
                Payment.PaymentStatus.FAILED
                ]:
                return payment
            
            normalized_result = (result or "").lower()

            if normalized_result == "success":
                self.mark_success(payment, provider_transaction_id)

            elif normalized_result in ["cancelled", "canceled", "cancel"]:
                self.mark_cancelled(payment)

            elif normalized_result == "expired":
                self.mark_expired(payment)

            else:
                self.mark_failed(payment)

            return payment

    def mark_success(self, payment, provider_transaction_id = None):
        payment.payment_status = Payment.PaymentStatus.SUCCESS
        payment.paid_at = timezone.now()

        update_fields = ["payment_status", "paid_at", "metadata", "updated_at"]

        if provider_transaction_id:
            payment.provider_transaction_id = provider_transaction_id
            update_fields.append("provider_transaction_id")
        elif str(payment.provider_transaction_id or "").startswith("STATICQR-"):
            payment.provider_transaction_id = None
            update_fields.append("provider_transaction_id")

        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "STATIC_QR",
            "gateway_status": "paid",
            "paid_amount": str(payment.amount),
        }

        payment.save(update_fields=update_fields)

        BookingService.confirm_booking(payment.booking)
        
        
    
    def mark_failed(self, payment):
        payment.payment_status = Payment.PaymentStatus.FAILED
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "STATIC_QR",
            "gateway_status": "failed",}
        
        payment.save(update_fields=["payment_status", "metadata", "updated_at"])
        
        BookingService.fail_booking(payment.booking)

    def mark_cancelled(self, payment):
        payment.payment_status = Payment.PaymentStatus.CANCELLED
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "STATIC_QR",
            "gateway_status": "cancelled",}
        payment.save(update_fields=["payment_status", "metadata", "updated_at"])

        BookingService.cancel_booking(payment.booking)

    def mark_expired(self, payment):
        payment.payment_status = Payment.PaymentStatus.EXPIRED
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "STATIC_QR",
            "gateway_status": "expired",
        }

        payment.save(update_fields=["payment_status", "metadata", "updated_at"])

        BookingService.expire_booking(payment.booking)


def create_gateway_payment(payment, request):
    if payment.payment_method == Payment.PaymentMethod.STATIC_QR:
        return StaticQrPaymentService().create_payment(payment, request)

    raise ValidationError("Hien tai chi ho tro thanh toan Static QR.")


def complete_static_qr_payment(transaction_id, provider_transaction_id = None, result="success"):
    return StaticQrPaymentService().complete_payment(
        transaction_id  = transaction_id, 
        provider_transaction_id = provider_transaction_id, 
        result = result)


class PaymentLifecycleService:
    @classmethod
    def get_queryset_for_user(cls, queryset, user):
        if user.is_staff or user.is_superuser:
            return queryset

        if user.is_provider and user.is_approved:
            return queryset.filter(booking__service__provider_id=user.id)

        if user.is_customer:
            return queryset.filter(user_id=user.id)

        return Payment.objects.none()

    @classmethod
    def apply_query_filters(cls, queryset, params):
        payment_id = params.get("payment_id") or params.get("id")
        if payment_id:
            if not str(payment_id).isdigit():
                return queryset.none()
            queryset = queryset.filter(id=payment_id)

        payment_status = params.get("payment_status")
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        payment_method = params.get("payment_method")
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)

        booking_id = params.get("booking")
        if booking_id:
            queryset = queryset.filter(booking_id=booking_id)

        from_date = params.get("from_date")
        if from_date:
            queryset = queryset.filter(created_at__date__gte=from_date)

        to_date = params.get("to_date")
        if to_date:
            queryset = queryset.filter(created_at__date__lte=to_date)

        return queryset

    @classmethod
    def expire_overdue_payments(cls, queryset):
        overdue_ids = list(
            queryset.filter(
                payment_status__in=Payment.active_statuses(),
                expires_at__isnull=False,
                expires_at__lte=timezone.now(),
            ).values_list("id", flat=True)
        )

        for payment in (
            Payment.objects
            .select_related("booking")
            .filter(id__in=overdue_ids)
        ):
            cls.expire_payment(payment)

    @classmethod
    def expire_payment_if_needed(cls, payment):
        if (
            payment.expires_at
            and payment.expires_at <= timezone.now()
            and payment.payment_status in Payment.active_statuses()
        ):
            return cls.expire_payment(payment)

        return payment

    @classmethod
    def mark_success(
        cls,
        payment,
        provider_transaction_id=None,
        gateway=None,
        raw_payload=None,
    ):
        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("booking")
                .get(pk=payment.pk)
            )

            if payment.payment_status in Payment.terminal_statuses():
                return payment

            payment.payment_status = Payment.PaymentStatus.SUCCESS
            payment.paid_at = timezone.now()

            if provider_transaction_id:
                payment.provider_transaction_id = str(provider_transaction_id)

            payment.metadata = {
                **(payment.metadata or {}),
                "gateway": gateway or (payment.metadata or {}).get("gateway"),
                "gateway_status": "paid",
                "paid_amount": str(payment.amount),
                "raw_payload": raw_payload,
            }

            update_fields = [
                "payment_status",
                "paid_at",
                "metadata",
                "updated_at",
            ]

            if provider_transaction_id:
                update_fields.append("provider_transaction_id")

            payment.save(update_fields=update_fields)

            BookingService.confirm_booking(payment.booking)

            return payment

    @classmethod
    def mark_failed(cls, payment, gateway=None, raw_payload=None):
        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("booking")
                .get(pk=payment.pk)
            )

            if payment.payment_status in Payment.terminal_statuses():
                return payment

            payment.payment_status = Payment.PaymentStatus.FAILED
            payment.metadata = {
                **(payment.metadata or {}),
                "gateway": gateway or (payment.metadata or {}).get("gateway"),
                "gateway_status": "failed",
                "raw_payload": raw_payload,
            }
            payment.save(update_fields=["payment_status", "metadata", "updated_at"])

            BookingService.fail_booking(payment.booking)

            return payment

    @classmethod
    def mark_review(cls, payment, gateway=None, raw_payload=None):
        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("booking")
                .get(pk=payment.pk)
            )

            if payment.payment_status in Payment.terminal_statuses():
                return payment

            payment.payment_status = Payment.PaymentStatus.REVIEW
            payment.metadata = {
                **(payment.metadata or {}),
                "gateway": gateway or (payment.metadata or {}).get("gateway"),
                "gateway_status": "review",
                "requires_review": True,
                "raw_payload": raw_payload,
            }
            payment.save(update_fields=["payment_status", "metadata", "updated_at"])

            return payment

    @classmethod
    def cancel_payment(cls, payment, gateway=None, raw_payload=None):
        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("booking")
                .get(pk=payment.pk)
            )

            if payment.payment_status in Payment.terminal_statuses():
                return payment

            payment.payment_status = Payment.PaymentStatus.CANCELLED
            payment.metadata = {
                **(payment.metadata or {}),
                "gateway": gateway or (payment.metadata or {}).get("gateway"),
                "gateway_status": "cancelled",
                "cancelled_at": timezone.now().isoformat(),
                "raw_payload": raw_payload,
            }
            payment.save(
                update_fields=[
                    "payment_status",
                    "metadata",
                    "updated_at",
                ]
            )

            BookingService.cancel_booking(payment.booking)

            return payment
        
    @classmethod
    def expire_payment(cls, payment, gateway=None, raw_payload=None):
        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("booking")
                .get(pk=payment.pk)
            )

            if payment.payment_status in Payment.terminal_statuses():
                return payment

            payment.payment_status = Payment.PaymentStatus.EXPIRED
            payment.metadata = {
                **(payment.metadata or {}),
                "gateway": gateway or (payment.metadata or {}).get("gateway"),
                "gateway_status": "expired",
                "expired_at": timezone.now().isoformat(),
                "raw_payload": raw_payload,
            }
            payment.save(
                update_fields=[
                    "payment_status",
                    "metadata",
                    "updated_at",
                ]
            )

            BookingService.expire_booking(payment.booking)

            return payment
