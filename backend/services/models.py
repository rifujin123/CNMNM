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
    vehicle_type = models.CharField(max_length=100)

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
            raise serializers.ValidationError('Giá phải lớn hơn 0')
        return value
class Comment(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='comments')
    travel_tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()

class Bus(Transport):
    pass

class Train(Transport):
    pass

class Flight(Transport):
    pass
