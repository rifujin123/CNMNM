from decimal import Decimal
from django.db import transaction
from django.urls import reverse
from django.utils import timezone
from bookings.models import Booking
from payments.models import Payment

class MockGatewayService:
    gateway_code = "MOCK"

    def create_payment_url(self, payment, request):
        checkout_path = reverse(
            "mock-gateway-checkout",
            kwargs={"transaction_id": payment.transaction_id},
        )
        return request.build_absolute_uri(checkout_path)

    def create_checkout(self, payment, request):
        payment.payment_url = self.create_payment_url(payment, request)
        payment.payment_status = Payment.PaymentStatus.PROCESSING
        payment.provider_transaction_id = f"MOCK-{payment.transaction_id}"
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": self.gateway_code,
            "gateway_status": "checkout_created",
        }
        payment.save(
            update_fields=[
                "payment_url",
                "payment_status",
                "provider_transaction_id",
                "metadata",
                "updated_at",
            ]
        )
        return payment

    def complete_payment(self, transaction_id, result):
        with transaction.atomic():
            payment = Payment.objects.select_related("booking").select_for_update().get(
                transaction_id=transaction_id
            )

            if payment.payment_status in [
                Payment.PaymentStatus.SUCCESS,
                Payment.PaymentStatus.FAILED,
                Payment.PaymentStatus.CANCELLED,
                Payment.PaymentStatus.EXPIRED,
                Payment.PaymentStatus.REFUNDED,
            ]:
                return payment

            normalized_result = (result or "").lower()
            if normalized_result == "success":
                self._mark_success(payment)
            elif normalized_result == "cancelled":
                self._mark_cancelled(payment)
            else:
                self._mark_failed(payment)

            return payment

    def _mark_success(self, payment):
        payment.payment_status = Payment.PaymentStatus.SUCCESS
        payment.paid_at = timezone.now()
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": self.gateway_code,
            "gateway_status": "paid",
            "paid_amount": str(Decimal(payment.amount)),
        }
        payment.save(update_fields=["payment_status", "paid_at", "metadata", "updated_at"])

        booking = payment.booking
        booking.payment_status = Booking.PaymentStatus.PAID
        booking.booking_status = Booking.BookingStatus.CONFIRMED
        booking.save(update_fields=["payment_status", "booking_status", "updated_date"])

    def _mark_failed(self, payment):
        payment.payment_status = Payment.PaymentStatus.FAILED
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": self.gateway_code,
            "gateway_status": "failed",
        }
        payment.save(update_fields=["payment_status", "metadata", "updated_at"])

        booking = payment.booking
        booking.payment_status = Booking.PaymentStatus.FAILED
        booking.booking_status = Booking.BookingStatus.PAYMENT_FAILED
        booking.save(update_fields=["payment_status", "booking_status", "updated_date"])

    def _mark_cancelled(self, payment):
        payment.payment_status = Payment.PaymentStatus.CANCELLED
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": self.gateway_code,
            "gateway_status": "cancelled",
        }
        payment.save(update_fields=["payment_status", "metadata", "updated_at"])

