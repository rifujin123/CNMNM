from django.db import models


class Category(models.Model):
    """Service category for organizing travel services."""

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class BaseService(models.Model):
    """Abstract base model for all travel services."""

    class ServiceType(models.TextChoices):
        TOUR = 'tour', 'Tour'
        HOTEL = 'hotel', 'Hotel'
        TRANSPORT = 'transport', 'Transport'

    name = models.CharField(max_length=255)
    description = models.TextField()
    service_type = models.CharField(max_length=20, choices=ServiceType.choices, default=ServiceType.TOUR)
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    departure_time = models.DateTimeField(null=True, blank=True)
    available_slots = models.PositiveIntegerField(default=0)
    star_rating = models.DecimalField(max_digits=2, decimal_places=1, default=5)
    review_count = models.PositiveIntegerField(default=0)
    address_detail = models.CharField(max_length=255, blank=True)

    city = models.ForeignKey('locations.City', on_delete=models.CASCADE, related_name='services')
    provider = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey('Category', on_delete=models.CASCADE, related_name='services')

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Base Services'
        indexes = [
            models.Index(fields=['service_type', 'is_active']),
            models.Index(fields=['provider', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_service_type_display()})"


class ServiceImage(models.Model):
    """Images for services."""

    service = models.ForeignKey('BaseService', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='services/')
    caption = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', '-id']

    def __str__(self):
        return f"Image for {self.service.name}"


class TravelTour(BaseService):
    """Tour service with time slots."""

    time_start = models.DateTimeField()
    empty_slot = models.PositiveIntegerField()


class Hotel(BaseService):
    """Hotel service with room types."""
    pass


class Transport(BaseService):
    """Transport service with seats and routes."""

    brand_name = models.CharField(max_length=255)
    license_plate = models.CharField(max_length=100, blank=True, null=True)


class RoomType(models.Model):
    """Room type for hotels."""

    hotel = models.ForeignKey('Hotel', on_delete=models.CASCADE, related_name='room_types')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    total_beds = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['hotel', 'name'], name='uniq_room_type_per_hotel'),
        ]

    def __str__(self):
        return f"{self.hotel.name} - {self.name}"


class Room(models.Model):
    """Individual room in a hotel."""

    hotel = models.ForeignKey('Hotel', on_delete=models.CASCADE, related_name='rooms')
    room_type = models.ForeignKey('RoomType', on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=10)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.hotel.name} - {self.room_type.name} - {self.room_number}"


class SeatType(models.Model):
    """Seat type for transports (economy, business, etc.)."""

    provider = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='seat_types')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['provider', 'name'], name='uniq_seat_type_per_provider'),
        ]

    def __str__(self):
        return self.name


class PhysicalSeat(models.Model):
    """Physical seat in a transport vehicle."""

    transport = models.ForeignKey('Transport', on_delete=models.CASCADE, related_name='physical_seats')
    seat_type = models.ForeignKey('SeatType', on_delete=models.CASCADE, related_name='physical_seats')
    seat_number = models.CharField(max_length=10)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['transport', 'seat_number'], name='uniq_seat_per_transport'),
        ]

    def __str__(self):
        return f"{self.transport.name} - Seat {self.seat_number}"


class Route(models.Model):
    """Transport route with departure/arrival times."""

    transport = models.ForeignKey('Transport', on_delete=models.CASCADE, related_name='routes')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    from_city = models.ForeignKey('locations.City', on_delete=models.CASCADE, related_name='departures')
    to_city = models.ForeignKey('locations.City', on_delete=models.CASCADE, related_name='arrivals')

    def __str__(self):
        return f"{self.transport.brand_name}: {self.from_city.name} → {self.to_city.name}"


class Package(models.Model):
    """Package for tour packages (meals, accommodation, etc.)."""

    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class TourPackage(models.Model):
    """Tour package with pricing."""

    tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, related_name='tour_packages')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    packages = models.ManyToManyField('Package', blank=True, related_name='tour_packages')

    def __str__(self):
        return f"{self.tour.name} - {self.name}"


class Wishlist(models.Model):
    """User wishlist for services."""

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='wishlists')
    service = models.ForeignKey('BaseService', on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'service'], name='uniq_wishlist_user_service'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.service.name}"


class PromoBanner(models.Model):
    """Promotional banners for the platform."""

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


# ==================== Comment (kept for views compatibility) ====================
class Comment(models.Model):
    """Review/Comment for travel tours."""

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='comments')
    travel_tour = models.ForeignKey('TravelTour', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'travel_tour'], name='uniq_comment_user_travel_tour'),
        ]


# ==================== Seat Status (kept for views compatibility) ====================
class SeatStatus(models.Model):
    """Seat availability status for transport routes."""

    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        HELD = 'held', 'Held'
        BOOKED = 'booked', 'Booked'

    route = models.ForeignKey('Route', on_delete=models.CASCADE, related_name='seat_statuses')
    physical_seat = models.ForeignKey('PhysicalSeat', on_delete=models.CASCADE, related_name='seat_statuses')
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True, related_name='seat_statuses')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['route', 'physical_seat'], name='uniq_seat_status_per_route'),
        ]

    def __str__(self):
        return f"{self.route} - {self.physical_seat.seat_number} - {self.status}"