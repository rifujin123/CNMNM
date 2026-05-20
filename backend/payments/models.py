from django.db import models
from django.conf import settings

class Payment(models.Model):

    class PaymentMethod(models.TextChoices):
        STATIC_QR = "STATIC_QR", "Static QR"

    class PaymentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        CANCELLED = "CANCELLED", "Cancelled"
        EXPIRED = "EXPIRED", "Expired"
        REFUNDED = "REFUNDED", "Refunded"
        REVIEW = "REVIEW", "Review"

    @classmethod
    def active_statuses(cls):
        return [
            cls.PaymentStatus.PENDING,
            cls.PaymentStatus.PROCESSING,
            cls.PaymentStatus.REVIEW,
        ]
    
    @classmethod
    def terminal_statuses(cls):
        return [
            cls.PaymentStatus.SUCCESS,
            cls.PaymentStatus.FAILED,
            cls.PaymentStatus.CANCELLED,
            cls.PaymentStatus.EXPIRED,
            cls.PaymentStatus.REFUNDED,
        ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,related_name="payments")
    booking = models.ForeignKey("bookings.Booking",on_delete=models.PROTECT,related_name="payments")

    payment_method = models.CharField(max_length=20,choices=PaymentMethod.choices)
    payment_status = models.CharField(max_length=20,choices=PaymentStatus.choices,default=PaymentStatus.PENDING)

    amount = models.DecimalField(max_digits=12,decimal_places=2)
    currency = models.CharField(max_length=10,default="VND")

    transaction_id = models.CharField(max_length=255, unique=True)

    payment_url = models.URLField(max_length=1000,blank=True,null=True)
    provider_transaction_id = models.CharField(max_length=255,blank=True,null=True)
    paid_at = models.DateTimeField(blank=True,null=True)
    refund_amount = models.DecimalField(max_digits=12,decimal_places=2,blank=True,null=True)

    metadata = models.JSONField(blank=True,null=True)

    expires_at = models.DateTimeField(blank=True, null=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["transaction_id"]),
            models.Index(fields=["payment_status"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.amount} - {self.payment_status}"
