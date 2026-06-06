from django.db import models
from django.conf import settings


class Payment(models.Model):
    """Payment model with multiple payment method support."""

    class PaymentMethod(models.TextChoices):
        PAYPAL = 'paypal', 'PayPal'
        STRIPE = 'stripe', 'Stripe'
        MOMO = 'momo', 'MoMo'
        ZALOPAY = 'zalopay', 'ZaloPay'
        CASH = 'cash', 'Cash'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'
        EXPIRED = 'expired', 'Expired'
        REFUNDED = 'refunded', 'Refunded'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='payments'
    )
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.PROTECT,
        related_name='payments'
    )

    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='VND')

    transaction_id = models.CharField(max_length=255, unique=True)
    payment_url = models.URLField(max_length=1000, blank=True, null=True)
    provider_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )
    metadata = models.JSONField(blank=True, null=True)
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['payment_status']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.amount} {self.currency} - {self.get_payment_status_display()}"


class Transaction(models.Model):
    """Audit log for all payment transactions."""

    class TransactionType(models.TextChoices):
        PAYMENT = 'payment', 'Payment'
        REFUND = 'refund', 'Refund'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    payment = models.ForeignKey(
        'Payment',
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='VND')
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
    description = models.TextField()
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount} {self.currency}"