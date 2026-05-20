from django.core.management.base import BaseCommand
from django.utils import timezone

from payments.models import Payment
from payments.payServices.payment_service import PaymentLifecycleService


class Command(BaseCommand):
    help = "Expire overdue active payments."

    def handle(self, *args, **kwargs):
        payments = Payment.objects.filter(
            payment_status__in=Payment.active_statuses(),
            expires_at__isnull=False,
            expires_at__lte=timezone.now(),
        ).select_related("booking")

        count = 0

        for payment in payments:
            PaymentLifecycleService.expire_payment(payment)
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Expired {count} payment(s)."))