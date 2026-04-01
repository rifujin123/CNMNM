from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.
class Continent(models.Model):
    name = models.CharField(max_length=255)
    def __str__(self):
        return self.name

class Country(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100, unique=True)
    icon = models.ImageField(upload_to='country_flags/', blank=True)
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
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='category_icons/', blank=True)
    def __str__(self):
        return self.name
    
class BaseService(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
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
    base_price = models.DecimalField(max_digits=12, decimal_places=2)

class Hotel(BaseService):
    star_rating = models.DecimalField(max_digits=2, decimal_places=1, validators=[MinValueValidator(1), MaxValueValidator(5)])
    address_detail = models.CharField(max_length=255, blank = True)

class RoomType(models.Model):
    hotel = models.ForeignKey('Hotel', on_delete=models.CASCADE, related_name='room_types')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    capacity = models.PositiveIntegerField(default = 2)
    total_rooms = models.PositiveIntegerField(default = 1)
    available_rooms = models.PositiveIntegerField()
    description = models.TextField(blank=True)

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

class TourPackage(models.Model):
    tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, related_name='packages')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    included_services = models.ManyToManyField('BaseService', related_name='included_in_packages', blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['tour', 'name'], name='uniq_package_name_per_tour'),
        ]

    def __str__(self):
        return f"{self.tour.name} - {self.name}"

class Bus(Transport):
    pass

class Train(Transport):
    pass

class Flight(Transport):
    pass
