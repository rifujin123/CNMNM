from django.db import models
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.
class Continent(models.Model):
    name = models.CharField(max_length=255)
    def __str__(self):
        return self.name

class Country(models.Model):
    name = models.CharField(max_length=255)
    continent = models.ForeignKey('Continent', on_delete=models.CASCADE, related_name='countries')
    def __str__(self):
        return self.name
    
class City(models.Model):
    name = models.CharField(max_length=255)
    country = models.ForeignKey('Country', on_delete = models.CASCADE, related_name = 'cities')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['country', 'name'], name='uniq_city_per_country'),
        ]

    def __str__(self):
        return f"{self.name}, {self.country.name}"

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

    city = models.ForeignKey('City', on_delete=models.CASCADE, related_name='services')

    provider = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey('Category',on_delete = models.CASCADE, related_name='services' )

    def __str__(self):
        return self.name

class TravelTour(BaseService):
    time_start = models.DateTimeField()
    empty_slot = models.PositiveIntegerField()

    @property
    def get_total_price(self):
        total_packages_price = self.tour_packages.aggregate(
            total=models.Sum("packages__price")
        )["total"]
        return (self.base_price or Decimal("0")) + (total_packages_price or Decimal("0"))


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
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    def __str__(self):
        return self.name
    
    
class Route(models.Model):
    transport = models.ForeignKey('Transport', on_delete=models.CASCADE, related_name='routes')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()

    from_city = models.ForeignKey('City', on_delete=models.CASCADE, related_name='departures')
    to_city = models.ForeignKey('City', on_delete=models.CASCADE, related_name='arrivals')

    def __str__(self):
        return f"{self.transport.brand_name} from {self.from_city.name} to {self.to_city.name} at {self.departure_time}"


class PhysicalSeat(models.Model):
    transport = models.ForeignKey('Transport', on_delete=models.CASCADE, related_name='physical_seats')
    seat_type = models.ForeignKey('SeatType', on_delete=models.CASCADE, related_name='physical_seats')
    seat_number = models.CharField(max_length=10)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['transport', 'seat_number'], name='uniq_seat_per_transport'),
        ]

    def __str__(self):
        return f"{self.transport.brand_name} - {self.seat_type.name} - Seat {self.seat_number}"
class SeatStatus(models.Model):
    class StatusChoices(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Còn trống'
        PENDING = 'PENDING', 'Đang giữ chỗ'
        BOOKED = 'BOOKED', 'Đã đặt'
    route = models.ForeignKey('Route', on_delete=models.CASCADE, related_name='seat_statuses')
    physical_seat = models.ForeignKey('PhysicalSeat', on_delete=models.CASCADE, related_name='seat_statuses')
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.AVAILABLE
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['route', 'physical_seat'], name='uniq_seat_status_per_route'),
        ]

class Package(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    

class TourPackage(models.Model):
    tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, related_name='tour_packages')
    name = models.CharField(max_length=255)
    packages = models.ManyToManyField('Package', related_name='packages', blank=True)

    @property
    def total_price(self):
        total = self.packages.aggregate(total=models.Sum("price"))["total"]
        return total or Decimal("0")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['tour', 'name'], name='uniq_package_name_per_tour'),
        ]

    def __str__(self):
        return f"{self.tour.name} - {self.name}"

class Comment(models.Model):
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='comments')
    travel_tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()

class Bus(Transport):
    pass

class Train(Transport):
    pass

class Flight(Transport):
    pass
