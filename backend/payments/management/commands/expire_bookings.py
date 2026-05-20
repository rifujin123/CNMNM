from django.core.management.base import BaseCommand
from django.utils import timezone

from bookings.models import Booking
from bookings.services import BookingService
from payments.models import Payment
from payments.payServices.payment_service import PaymentLifecycleService


class Command(BaseCommand):
    help = "Expire overdue pending unpaid bookings."

    def handle(self, *args, **kwargs):
        bookings = (
            Booking.objects
            .filter(
                booking_status=Booking.BookingStatus.PENDING,
                payment_status=Booking.PaymentStatus.UNPAID,
                expires_at__isnull=False,
                expires_at__lte=timezone.now(),
            )
            .select_related("user", "service")
            .prefetch_related("payments")
        )

        expired_booking_count = 0
        expired_payment_count = 0

        for booking in bookings:
            active_payment = (
                booking.payments
                .filter(payment_status__in=Payment.active_statuses())
                .order_by("-created_at")
                .first()
            )

            if active_payment:
                PaymentLifecycleService.expire_payment(active_payment)
                expired_payment_count += 1
            else:
                BookingService.expire_booking(booking)
                expired_booking_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Expired {expired_booking_count} booking(s), "
                f"{expired_payment_count} active payment(s)."
            )
        )