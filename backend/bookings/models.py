from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

# Create your models here.
class Booking(models.Model):

    class BookingStatus(models.TextChoices):
        PENDING   = 'pending'
        CONFIRMED = 'confirmed'
        CANCELLED = 'cancelled'
    
    class PaymentStatus(models.TextChoices):
        UNPAID = 'unpaid'
        PAID = 'paid'
        FAILED = 'failed'
        REFUNDED = 'refunded'

    class PaymentMethod(models.TextChoices):
        CASH = 'cash'
        MOMO = 'momo'
        VNPAY = 'vnpay'


    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='bookings')
    service = models.ForeignKey('services.BaseService', on_delete=models.PROTECT, related_name='bookings')
    room_type = models.ForeignKey('services.RoomType', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    seat_type = models.ForeignKey('services.SeatType', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')

    quantity = models.PositiveIntegerField(default=1, validators = [MinValueValidator(1)])
    total_price = models.DecimalField(max_digits=12, decimal_places=2, validators = [MinValueValidator(0)])
    booking_status = models.CharField(max_length=20, choices = BookingStatus.choices, default=BookingStatus.PENDING)

    payment_status = models.CharField(max_length=20, choices = PaymentStatus.choices, default=PaymentStatus.UNPAID)
    payment_method = models.CharField(max_length=50, choices = PaymentMethod.choices, blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"Booking :{self.id}, {self.user.email} , {self.service.name}"
    