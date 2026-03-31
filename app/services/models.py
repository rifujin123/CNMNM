from django.core.exceptions import ValidationError
from django.db import models

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

class SeatType(models.Model):
    transport = models.ForeignKey('Transport', on_delete=models.CASCADE, related_name='seat_types')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['transport', 'name'], name='uniq_seat_type_per_transport'),
        ]

    def __str__(self):
        return f"{self.transport.brand_name} - {self.name}"

class TourPackage(models.Model):
    tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, related_name='packages')
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    included_services = models.ManyToManyField('BaseService', related_name='included_in_packages', blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['tour', 'title'], name='uniq_package_title_per_tour'),
        ]

    def __str__(self):
        return f"{self.tour.name} - {self.title}"

class Bus(Transport):
    pass

class Train(Transport):
    pass

class Flight(Transport):
    pass
