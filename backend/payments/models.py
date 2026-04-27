from django.db import models
from django.conf import settings

class Payment(models.Model):

    class PaymentMethod(models.TextChoices):
        MOMO = "MOMO", "MoMo"
        ZALOPAY = "ZALOPAY", "ZaloPay"
        VNPAY = "VNPAY", "VNPay"

    class PaymentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        CANCELLED = "CANCELLED", "Cancelled"
        REFUNDED = "REFUNDED", "Refunded"

    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="payments")
    booking = models.ForeignKey("bookings.booking",on_delete=models.CASCADE,related_name="payments")
    amount = models.DecimalField(max_digits=10,decimal_places=2)
    currency = models.CharField(max_length=10,default="VND")
    payment_method = models.CharField(max_length=20,choices=PaymentMethod.choices)
    payment_status = models.CharField(max_length=20,choices=PaymentStatus.choices,default=PaymentStatus.PENDING)

    transaction_id = models.CharField(max_length=255,unique=True)
    provider_transaction_id = models.CharField(max_length=255,blank=True,null=True)
    payment_url = models.URLField(blank=True,null=True)
    paid_at = models.DateTimeField(blank=True,null=True)
    refund_amount = models.DecimalField(max_digits=10,decimal_places=2,blank=True,null=True)
    metadata = models.JSONField(blank=True,null=True)
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
