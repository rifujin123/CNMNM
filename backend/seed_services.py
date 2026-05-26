#!/usr/bin/env python
"""
Seed script for services (Tour, Hotel, Transport) with all related data.
Run: python seed_services.py
"""
import django
import os
import sys
from datetime import timedelta
from decimal import Decimal

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from django.utils import timezone
from locations.models import City
from accounts.models import User
from services.models import (
    Category, TravelTour, Hotel, Transport, Package, TourPackage,
    RoomType, Room, SeatType, PhysicalSeat, Route, SeatStatus
)


def seed_all():
    print("=== Starting seed ===")

    # Get reference data
    cities = list(City.objects.all())
    providers = list(User.objects.filter(is_provider=True))

    if not cities:
        print("ERROR: No cities found. Seed cities first.")
        return

    if not providers:
        print("ERROR: No providers found. Create provider users first.")
        return

    provider = providers[0]

    # Get or create categories
    cat_tour, _ = Category.objects.get_or_create(name='Tour')
    cat_hotel, _ = Category.objects.get_or_create(name='Hotel')
    cat_transport, _ = Category.objects.get_or_create(name='Transport')

    print(f"Provider: {provider.email}")
    print(f"Cities: {[c.name for c in cities]}")

    # Keep existing seed data because bookings may protect services
    print("\n=== Keeping old seed data ===")

    # Create packages
    print("\n=== Creating packages ===")
    packages = []
    for i in range(1, 6):
        pkg, created = Package.objects.get_or_create(name=f'Seed Package {i}')
        packages.append(pkg)
        if created:
            print(f"Created: {pkg.name}")

    # Create seat types
    print("\n=== Creating seat types ===")
    seat_types = []
    for i, name in enumerate(['Seed Seat Economy', 'Seed Seat Business', 'Seed Seat VIP'], 1):
        st, created = SeatType.objects.get_or_create(
            provider=provider,
            name=name,
            defaults={'price': Decimal(50000 * i)}
        )
        seat_types.append(st)
        if created:
            print(f"Created: {st.name} - {st.price}")

    # Seed Tours
    print("\n=== Seeding Tours ===")
    now = timezone.now()
    for i in range(1, 6):
        city = cities[i % len(cities)]
        tour = TravelTour.objects.create(
            name=f'Seed Tour {i}',
            description=f'Amazing tour experience in {city.name}. Explore beautiful landscapes and local culture.',
            star_rating=Decimal('4.5'),
            base_price=Decimal(1000000 + i * 100000),
            is_active=True,
            city=city,
            provider=provider,
            category=cat_tour,
            time_start=now + timedelta(days=7 + i),
            empty_slot=20 + i * 5,
        )

        # Create 2 tour packages per tour
        for j in range(1, 3):
            pkg = TourPackage.objects.create(
                tour=tour,
                name=f'Package {j} - {tour.name}',
                price=Decimal(200000 * j),
            )
            pkg.packages.set(packages[:2])

        print(f"Created: {tour.name} in {city.name} - {tour.tour_package.count()} packages")

    # Seed Hotels
    print("\n=== Seeding Hotels ===")
    for i in range(1, 6):
        city = cities[i % len(cities)]
        hotel = Hotel.objects.create(
            name=f'Seed Hotel {i}',
            description=f'Luxury hotel in {city.name}. Modern amenities and excellent service.',
            star_rating=Decimal('4.0') + Decimal(i % 5) * Decimal('0.2'),
            base_price=Decimal(500000 + i * 50000),
            is_active=True,
            city=city,
            provider=provider,
            category=cat_hotel,
            address_detail=f'{i * 10} Main Street, {city.name}',
        )

        # Create 2 room types per hotel
        for j, room_type_name in enumerate(['Standard', 'Deluxe'], 1):
            rt = RoomType.objects.create(
                hotel=hotel,
                name=room_type_name,
                price=Decimal(300000 * j),
            )

            # Create 3 rooms per room type
            for k in range(1, 4):
                Room.objects.create(
                    hotel=hotel,
                    room_type=rt,
                    room_number=f'{j}{k}0{i}',
                    is_available=True,
                    total_beds=j,
                )

        print(f"Created: {hotel.name} in {city.name} - {hotel.room_types.count()} room types, {hotel.rooms.count()} rooms")

    # Seed Transports
    print("\n=== Seeding Transports ===")
    for i in range(1, 6):
        city = cities[i % len(cities)]
        transport = Transport.objects.create(
            name=f'Seed Transport {i}',
            description=f'Comfortable transport service from {city.name}. Safe and reliable.',
            star_rating=Decimal('4.3'),
            base_price=Decimal(200000 + i * 20000),
            is_active=True,
            city=city,
            provider=provider,
            category=cat_transport,
            brand_name=f'Brand {i}',
            license_plate=f'29A-{1000 + i}',
            vehicle_type='Bus' if i % 2 == 0 else 'Van',
        )

        # Create physical seats (20 seats per transport)
        for seat_num in range(1, 21):
            seat_type = seat_types[seat_num % len(seat_types)]
            PhysicalSeat.objects.create(
                transport=transport,
                seat_type=seat_type,
                seat_number=f'A{seat_num}',
            )

        # Create 2 routes per transport
        for j in range(1, 3):
            from_city = cities[j % len(cities)]
            to_city = cities[(j + 1) % len(cities)]

            route = Route.objects.create(
                transport=transport,
                from_city=from_city,
                to_city=to_city,
                departure_time=now + timedelta(days=3 + j, hours=8 + j * 2),
                arrival_time=now + timedelta(days=3 + j, hours=12 + j * 2),
            )

            # Create seat statuses for all physical seats on this route
            for physical_seat in transport.physical_seats.all():
                SeatStatus.objects.create(
                    route=route,
                    physical_seat=physical_seat,
                    status=SeatStatus.Status.AVAILABLE,
                )

        print(f"Created: {transport.name} in {city.name} - {transport.physical_seats.count()} seats, {transport.routes.count()} routes")

    print("\n=== Seed complete ===")
    print(f"Tours: {TravelTour.objects.filter(name__startswith='Seed Tour').count()}")
    print(f"Hotels: {Hotel.objects.filter(name__startswith='Seed Hotel').count()}")
    print(f"Transports: {Transport.objects.filter(name__startswith='Seed Transport').count()}")
    print(f"Routes: {Route.objects.count()}")
    print(f"SeatStatuses: {SeatStatus.objects.count()}")
    print(f"Rooms: {Room.objects.count()}")


if __name__ == '__main__':
    seed_all()