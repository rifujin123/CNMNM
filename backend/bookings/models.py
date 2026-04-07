from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

# Create your models here.
class booking(models.Model):

    class Status(models.TextChoices):
        PENDING   = 'pending'
        CONFIRMED = 'confirmed'
        CANCELLED = 'cancelled'
        COMPLETED = 'completed'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey('services.BaseService', on_delete=models.CASCADE, related_name='bookings')
    room_type = models.ForeignKey('services.RoomType', on_delete=models.SET_NULL, null=True, blank=True,related_name='bookings')
    seat_type = models.ForeignKey('services.SeatType', on_delete=models.SET_NULL, null=True, blank=True,related_name='bookings')

    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    total_price = models.DecimalField(max_digits=12,decimal_places=2,validators=[MinValueValidator(0)])
    booking_status = models.CharField(max_length=20, choices = Status.choices, default=Status.PENDING)

    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"Booking :{self.id}, {self.name} , {self.service.name}"
    