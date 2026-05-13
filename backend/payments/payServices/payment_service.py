from bookings.models import Booking
from payments.models import Payment
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

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
            payment = ( Payment.objects.select_for_update().get(transaction_id=transaction_id) )

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
            elif normalized_result == "cancelled":
                self.mark_cancelled(payment)
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

        booking = payment.booking
        booking.payment_status = Booking.PaymentStatus.PAID
        booking.booking_status = Booking.BookingStatus.CONFIRMED
        booking.save(
            update_fields=[
                "payment_status", 
                "booking_status", 
                "updated_date"])
        
        
    
    def mark_failed(self, payment):
        payment.payment_status = Payment.PaymentStatus.FAILED
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "STATIC_QR",
            "gateway_status": "failed",}
        
        payment.save(update_fields=["payment_status", "metadata", "updated_at"])
        
        booking = payment.booking
        booking.payment_status = Booking.PaymentStatus.FAILED
        booking.booking_status = Booking.BookingStatus.PAYMENT_FAILED
        booking.save(
            update_fields=[
                "payment_status", 
                "booking_status", 
                "updated_date"])

    def mark_cancelled(self, payment):
        payment.payment_status = Payment.PaymentStatus.CANCELLED
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "STATIC_QR",
            "gateway_status": "cancelled",}
        payment.save(update_fields=["payment_status", "metadata", "updated_at"])


def create_gateway_payment(payment, request):
    if payment.payment_method == Payment.PaymentMethod.STATIC_QR:
        return StaticQrPaymentService().create_payment(payment, request)

    if payment.payment_method == Payment.PaymentMethod.MOMO:
        raise ValidationError("MoMo chưa implement")

    if payment.payment_method == Payment.PaymentMethod.VNPAY:
        raise ValidationError("VNPay chưa implement")

    raise ValidationError("Phương thức thanh toán không hợp lệ")

def complete_static_qr_payment(transaction_id, provider_transaction_id = None, result="success"):
    return StaticQrPaymentService().complete_payment(
        transaction_id  = transaction_id, 
        provider_transaction_id = provider_transaction_id, 
        result = result)