from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
from locations.models import City
# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=255)
    def __str__(self):
        return self.name

class BaseService(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    star_rating = models.DecimalField(max_digits=2, decimal_places=1, validators=[MinValueValidator(1), MaxValueValidator(5)], default=5)
    base_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    city = models.ForeignKey('locations.City', on_delete=models.CASCADE, related_name='services')

    provider = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey('Category',on_delete = models.CASCADE, related_name='services' )

    def __str__(self):
        return self.name

class ServiceImage(models.Model):
    service = models.ForeignKey('BaseService', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='services/')
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Image #{self.id} - {self.service.name}"

class PromoBanner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to='promo_banners/')
    cta_text = models.CharField(max_length=100, blank=True)
    background_color = models.CharField(max_length=20, default='#2563EB')
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return self.title

class TravelTour(BaseService):
    time_start = models.DateTimeField()
    empty_slot = models.PositiveIntegerField()

    @property
    def total_price(self):
        return self.base_price + self.tour_package.price

class Hotel(BaseService):
    address_detail = models.CharField(max_length=255, blank = True)
    @property
    def total_rooms(self):
        return self.rooms.count()

class Room(models.Model):
    hotel = models.ForeignKey('Hotel', on_delete=models.CASCADE, related_name='rooms')
    room_type = models.ForeignKey('RoomType', on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=10)
    is_available = models.BooleanField(default=True)
    total_beds = models.PositiveIntegerField(default = 1)
    def __str__(self):
        return f"{self.hotel.name} - {self.room_type.name} - {self.room_number}"

class RoomType(models.Model):
    hotel = models.ForeignKey('Hotel', on_delete=models.CASCADE, related_name='room_types')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['hotel', 'name'], name='uniq_room_type_per_hotel'),
        ]

    def __str__(self):
        return f"{self.hotel.name} - {self.name}"

class Transport(BaseService):
    brand_name = models.CharField(max_length=255)
    license_plate = models.CharField(max_length=100, blank = True, null = True)

    @property
    def total_seats(self):
        return self.physical_seats.count()

class SeatType(models.Model):
    provider = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='seat_types',
    )
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['provider', 'name'],
                name='uniq_seat_type_name_per_provider',
            ),
        ]

    def __str__(self):
        return self.name
    
    
class Route(models.Model):
    transport = models.ForeignKey('Transport', on_delete=models.CASCADE, related_name='routes')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()

    from_city = models.ForeignKey('locations.City', on_delete=models.CASCADE, related_name='departures')
    to_city = models.ForeignKey('locations.City', on_delete=models.CASCADE, related_name='arrivals')

    def __str__(self):
        return f"{self.transport.brand_name} from {self.from_city.name} to {self.to_city.name} at {self.departure_time}"

class Package(models.Model):
    name = models.CharField(max_length=255)    

class TourPackage(models.Model):
    tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, related_name='tour_package')
    name = models.CharField(max_length=255)
    packages = models.ManyToManyField('Package', related_name='packages', blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.tour.name} - {self.name}"

    def validate_price(self, value):
        if value <= 0:
            raise ValidationError('Value must be greater than zero.')
        return value
    
class Comment(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='comments')
    travel_tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5, validators=[MinValueValidator(1), MaxValueValidator(5)])

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'travel_tour'], name='uniq_comment_user_travel_tour'),
        ]

class Wishlist(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='wishlists')
    service = models.ForeignKey('BaseService', on_delete=models.CASCADE, related_name='saved_by')
    travel_tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, null=True, blank=True, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'service'], name='uniq_wishlist_user_service'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.service.name}"


class PhysicalSeat(models.Model):
    transport = models.ForeignKey('Transport',on_delete=models.CASCADE,related_name='physical_seats')
    seat_type = models.ForeignKey('SeatType',on_delete=models.CASCADE,related_name='physical_seats')
    seat_number = models.CharField(max_length=10)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['transport', 'seat_number'],
                name='uniq_seat_per_transport'
            )
        ]

    def __str__(self):
        return f"{self.transport.name} - Seat {self.seat_number}"
    

class SeatStatus(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        HELD = 'held', 'Held'
        BOOKED = 'booked', 'Booked'

    route = models.ForeignKey('Route',on_delete=models.CASCADE,related_name='seat_statuses')
    physical_seat = models.ForeignKey('PhysicalSeat',on_delete=models.CASCADE,related_name='seat_statuses')
    booking = models.ForeignKey('bookings.Booking',on_delete=models.SET_NULL,null=True,blank=True,related_name='seat_statuses')
    status = models.CharField(max_length=20,choices=Status.choices,default=Status.AVAILABLE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['route', 'physical_seat'],
                name='uniq_seat_status_per_route'
            )
        ]

    def __str__(self):
        return f"{self.route} - {self.physical_seat.seat_number} - {self.status}"
