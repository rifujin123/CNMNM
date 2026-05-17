from bookings.models import Booking
from payments.models import Payment
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from bookings.services import BookingService

class StaticQrPaymentService:
    def create_payment(self, payment, request):
        payment.payment_status = Payment.PaymentStatus.PROCESSING
        payment.provider_transaction_id = f"STATICQR-{payment.booking_id}"
        payment.payment_url = None
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "STATIC_QR",
            "gateway_status": "qr_created",
            "transfer_content": payment.transaction_id,
            "amount": str(payment.amount),
        }
        payment.save()
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

        if provider_transaction_id:
            payment.provider_transaction_id = provider_transaction_id

        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "STATIC_QR",
            "gateway_status": "paid",
            "paid_amount": str(payment.amount),
        }

        update_fields = ["payment_status", "paid_at", "metadata", "updated_at"]
        if provider_transaction_id:
            update_fields.append("provider_transaction_id")
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

    if payment.payment_method == Payment.PaymentMethod.MOMO:
        from .momo_service import MoMoPaymentService
        return MoMoPaymentService.create_payment(payment, request)

    if payment.payment_method == Payment.PaymentMethod.VNPAY:
        from .vnpay_service import VnPayPaymentService
        return VnPayPaymentService.create_payment(payment, request)

    raise ValidationError("Phương thức thanh toán không hợp lệ")

def complete_static_qr_payment(transaction_id, provider_transaction_id = None, result="success"):
    return StaticQrPaymentService().complete_payment(
        transaction_id  = transaction_id, 
        provider_transaction_id = provider_transaction_id, 
        result = result)


class PaymentLifecycleService:
    @classmethod
    def cancel_payment(cls, payment):
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
                "gateway_status": "cancelled_by_customer",
                "cancelled_at": timezone.now().isoformat(),
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
    def expire_payment(cls, payment):
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
                "gateway_status": "expired",
                "expired_at": timezone.now().isoformat(),
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