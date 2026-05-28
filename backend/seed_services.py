#!/usr/bin/env python
"""
Seed full demo data for Travel Booking System.
WARNING: Deletes existing app data before seeding.
Run: python seed_services.py
"""
import os
import sys
from datetime import timedelta
from decimal import Decimal

import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from oauth2_provider.models import Application

from accounts.models import ProviderProfile, User
from bookings.models import Booking
from locations.models import City, Country
from payments.models import Payment
from services.models import (
    BaseService,
    Category,
    Comment,
    Hotel,
    Package,
    PhysicalSeat,
    PromoBanner,
    Room,
    RoomType,
    Route,
    SeatStatus,
    SeatType,
    ServiceImage,
    TourPackage,
    Transport,
    TravelTour,
    Wishlist,
)

PASSWORD = "Password123@"


def wipe_data():
    print("=== Wiping existing data ===")

    Payment.objects.all().delete()
    SeatStatus.objects.all().delete()
    Booking.objects.all().delete()
    Wishlist.objects.all().delete()
    Comment.objects.all().delete()
    ServiceImage.objects.all().delete()
    PromoBanner.objects.all().delete()

    Room.objects.all().delete()
    RoomType.objects.all().delete()
    Route.objects.all().delete()
    PhysicalSeat.objects.all().delete()
    SeatType.objects.all().delete()
    TourPackage.objects.all().delete()
    Package.objects.all().delete()

    TravelTour.objects.all().delete()
    Hotel.objects.all().delete()
    Transport.objects.all().delete()
    BaseService.objects.all().delete()
    Category.objects.all().delete()

    ProviderProfile.objects.all().delete()
    User.objects.all().delete()
    City.objects.all().delete()
    Country.objects.all().delete()


def create_accounts():
    print("=== Creating accounts ===")

    admin = User.objects.create_superuser(
        username="admin",
        email="admin@kmtravel.test",
        password=PASSWORD,
        is_customer=False,
        is_provider=False,
        is_approved=True,
    )

    provider_verified = User.objects.create_user(
        username="provider_verified",
        email="provider.verified@kmtravel.test",
        password=PASSWORD,
        is_provider=True,
        is_customer=False,
        is_approved=True,
    )
    ProviderProfile.objects.create(
        user=provider_verified,
        business_name="KM Travel Verified Provider",
        business_license="licenses/provider_verified_license.jpg",
        tax_code="KMV1234567",
        is_verified=True,
    )

    provider_pending = User.objects.create_user(
        username="provider_pending",
        email="provider.pending@kmtravel.test",
        password=PASSWORD,
        is_provider=True,
        is_customer=False,
        is_approved=False,
    )
    ProviderProfile.objects.create(
        user=provider_pending,
        business_name="KM Travel Pending Provider",
        business_license="licenses/provider_pending_license.jpg",
        tax_code="KMP7654321",
        is_verified=False,
    )

    user_one = User.objects.create_user(
        username="user_one",
        email="user1@kmtravel.test",
        password=PASSWORD,
        is_customer=True,
        is_provider=False,
        is_approved=True,
    )
    user_two = User.objects.create_user(
        username="user_two",
        email="user2@kmtravel.test",
        password=PASSWORD,
        is_customer=True,
        is_provider=False,
        is_approved=True,
    )

    return {
        "admin": admin,
        "provider_verified": provider_verified,
        "provider_pending": provider_pending,
        "customers": [user_one, user_two],
    }


def create_locations_and_categories():
    print("=== Creating locations and categories ===")

    vietnam = Country.objects.create(name="Việt Nam")
    cities = [
        City.objects.create(name="Hà Nội", country=vietnam),
        City.objects.create(name="Đà Nẵng", country=vietnam),
        City.objects.create(name="TP.HCM", country=vietnam),
        City.objects.create(name="Huế", country=vietnam),
        City.objects.create(name="Nha Trang", country=vietnam),
    ]

    categories = {
        "tour": Category.objects.create(name="Tour"),
        "hotel": Category.objects.create(name="Hotel"),
        "transport": Category.objects.create(name="Transport"),
    }

    return cities, categories


def create_services(provider, cities, categories):
    print("=== Creating services ===")

    now = timezone.now()
    packages = [Package.objects.create(name=f"Seed Package {i}") for i in range(1, 6)]

    tour_names = [
        "Hành Trình Di Sản Hà Nội",
        "Khám Phá Biển Đà Nẵng",
        "Sài Gòn City Tour",
        "Cố Đô Huế Trọn Ngày",
        "Nha Trang Biển Xanh",
        "Hạ Long Du Thuyền 2N1Đ",
        "Đà Lạt Săn Mây",
        "Phú Quốc Nghỉ Dưỡng",
        "Sapa Bản Làng Tây Bắc",
        "Mekong Delta Discovery",
    ]
    tour_package_names = [
        ("Gói Tiêu Chuẩn", "Gói Cao Cấp"),
        ("Gói Gia Đình", "Gói Trăng Mật"),
        ("Gói City Pass", "Gói Ẩm Thực Đêm"),
        ("Gói Di Sản", "Gói Cung Đình"),
        ("Gói Biển Đảo", "Gói Lặn Ngắm San Hô"),
        ("Gói Du Thuyền Classic", "Gói Du Thuyền Luxury"),
        ("Gói Săn Mây", "Gói Cắm Trại"),
        ("Gói Resort", "Gói Island Hopping"),
        ("Gói Trekking", "Gói Homestay"),
        ("Gói Sông Nước", "Gói Chợ Nổi"),
    ]
    hotel_names = [
        "Hanoi Lotus Boutique Hotel",
        "Danang Ocean Pearl Resort",
        "Saigon Central Grand Hotel",
        "Hue Imperial Riverside Hotel",
        "Nha Trang Coral Bay Hotel",
        "Ha Long Marina Bay Hotel",
        "Dalat Pine Valley Resort",
        "Phu Quoc Sunset Beach Resort",
        "Sapa Mountain View Lodge",
        "Can Tho Mekong Riverside Hotel",
    ]
    transport_names = [
        "Hanoi Express Limousine",
        "Danang Coastal Shuttle",
        "Saigon Airport Transfer",
        "Hue Heritage Bus",
        "Nha Trang Beach Coach",
        "Ha Long Cruise Connector",
        "Dalat Highland Limousine",
        "Phu Quoc Island Shuttle",
        "Sapa Night Express",
        "Mekong Delta Busline",
    ]
    transport_brands = [
        "Hanoi Express",
        "Coastal Shuttle",
        "Saigon Transfer",
        "Heritage Bus",
        "Beach Coach",
        "Cruise Connector",
        "Highland Limousine",
        "Island Shuttle",
        "Night Express",
        "Mekong Busline",
    ]

    tours = []
    for i, tour_name in enumerate(tour_names, start=1):
        city = cities[(i - 1) % len(cities)]
        tour = TravelTour.objects.create(
            name=tour_name,
            description=f"Tour trải nghiệm {city.name} với lịch trình tham quan, ẩm thực, văn hóa địa phương.",
            star_rating=Decimal("4.5"),
            base_price=Decimal(1_000_000 + i * 120_000),
            is_active=True,
            city=city,
            provider=provider,
            category=categories["tour"],
            time_start=now + timedelta(days=7 + i),
            empty_slot=20 + i,
        )
        for j, package_name in enumerate(tour_package_names[i - 1], start=1):
            tour_package = TourPackage.objects.create(
                tour=tour,
                name=f"{package_name} - {tour.name}",
                price=Decimal(250_000 * j),
            )
            tour_package.packages.set(packages[: 2 + (j % 2)])
        tours.append(tour)

    hotels = []
    for i, hotel_name in enumerate(hotel_names, start=1):
        city = cities[(i - 1) % len(cities)]
        hotel = Hotel.objects.create(
            name=hotel_name,
            description=f"Khách sạn tiêu chuẩn cao tại {city.name}, phù hợp du lịch và công tác.",
            star_rating=Decimal("4.0") + Decimal(i % 5) * Decimal("0.2"),
            base_price=Decimal(500_000 + i * 60_000),
            is_active=True,
            city=city,
            provider=provider,
            category=categories["hotel"],
            address_detail=f"{i * 12} Đường Du Lịch, {city.name}",
        )
        for room_type_name, price, beds in [
            ("Standard", Decimal("300000"), 1),
            ("Deluxe", Decimal("550000"), 2),
        ]:
            room_type = RoomType.objects.create(hotel=hotel, name=room_type_name, price=price)
            for k in range(1, 4):
                Room.objects.create(
                    hotel=hotel,
                    room_type=room_type,
                    room_number=f"{i:02d}{room_type_name[0]}{k}",
                    is_available=True,
                    total_beds=beds,
                )
        hotels.append(hotel)

    seat_types = [
        SeatType.objects.create(provider=provider, name="Economy", price=Decimal("50000")),
        SeatType.objects.create(provider=provider, name="Business", price=Decimal("120000")),
        SeatType.objects.create(provider=provider, name="VIP", price=Decimal("200000")),
    ]

    transports = []
    for i, transport_name in enumerate(transport_names, start=1):
        city = cities[(i - 1) % len(cities)]
        transport = Transport.objects.create(
            name=transport_name,
            description=f"Dịch vụ di chuyển an toàn, đúng giờ, xuất phát từ {city.name}.",
            star_rating=Decimal("4.3"),
            base_price=Decimal(180_000 + i * 25_000),
            is_active=True,
            city=city,
            provider=provider,
            category=categories["transport"],
            brand_name=transport_brands[i - 1],
            license_plate=f"29A-{1000 + i}",
        )
        for seat_num in range(1, 21):
            PhysicalSeat.objects.create(
                transport=transport,
                seat_type=seat_types[seat_num % len(seat_types)],
                seat_number=f"A{seat_num:02d}",
            )
        for j in range(1, 3):
            route = Route.objects.create(
                transport=transport,
                from_city=cities[(i + j - 1) % len(cities)],
                to_city=cities[(i + j) % len(cities)],
                departure_time=now + timedelta(days=3 + j, hours=8 + j),
                arrival_time=now + timedelta(days=3 + j, hours=12 + j),
            )
            for physical_seat in transport.physical_seats.all():
                SeatStatus.objects.create(
                    route=route,
                    physical_seat=physical_seat,
                    status=SeatStatus.Status.AVAILABLE,
                )
        transports.append(transport)

    return tours, hotels, transports


def create_booking_with_payment(user, service, total_price, created_date, **kwargs):
    booking = Booking.objects.create(
        user=user,
        service=service,
        total_price=total_price,
        quantity=kwargs.pop("quantity", 1),
        booking_status=Booking.BookingStatus.COMPLETED,
        payment_status=Booking.PaymentStatus.PAID,
        **kwargs,
    )
    Booking.objects.filter(pk=booking.pk).update(created_date=created_date, updated_date=created_date)
    booking.refresh_from_db()

    payment = Payment.objects.create(
        user=user,
        booking=booking,
        payment_method=Payment.PaymentMethod.STATIC_QR,
        payment_status=Payment.PaymentStatus.SUCCESS,
        amount=total_price,
        transaction_id=f"SEED-{booking.id}-{int(created_date.timestamp())}",
        paid_at=created_date,
        metadata={"seed": True, "service_id": service.id},
    )
    Payment.objects.filter(pk=payment.pk).update(created_at=created_date, updated_at=created_date)
    return booking


def create_bookings_and_payments(customers, tours, hotels, transports):
    print("=== Creating bookings and payments ===")

    now = timezone.now()
    created_dates = [
        now - timedelta(hours=2),
        now - timedelta(days=2),
        now - timedelta(days=5),
        now - timedelta(days=12),
        now - timedelta(days=20),
    ]

    for i in range(10):
        user = customers[i % len(customers)]
        created_date = created_dates[i % len(created_dates)]

        tour_package = tours[i].tour_package.first()
        create_booking_with_payment(
            user=user,
            service=tours[i],
            tour_package=tour_package,
            total_price=tours[i].base_price + tour_package.price,
            quantity=1,
            created_date=created_date,
        )

        room_type = hotels[i].room_types.first()
        booking = create_booking_with_payment(
            user=user,
            service=hotels[i],
            room_type=room_type,
            total_price=hotels[i].base_price + room_type.price,
            quantity=1,
            created_date=created_date,
        )
        first_room = room_type.rooms.first()
        if first_room:
            booking.rooms.add(first_room)

        route = transports[i].routes.first()
        seat_status = route.seat_statuses.filter(status=SeatStatus.Status.AVAILABLE).first()
        seat_type = seat_status.physical_seat.seat_type if seat_status else transports[i].physical_seats.first().seat_type
        transport_booking = create_booking_with_payment(
            user=user,
            service=transports[i],
            route=route,
            seat_type=seat_type,
            total_price=transports[i].base_price + seat_type.price,
            quantity=1,
            created_date=created_date,
        )
        if seat_status:
            seat_status.status = SeatStatus.Status.BOOKED
            seat_status.booking = transport_booking
            seat_status.save(update_fields=["status", "booking"])


def print_summary():
    print("=== Seed complete ===")
    print(f"Accounts: {User.objects.count()}")
    print(f"Provider profiles: {ProviderProfile.objects.count()}")
    print(f"Tours: {TravelTour.objects.count()}")
    print(f"Hotels: {Hotel.objects.count()}")
    print(f"Transports: {Transport.objects.count()}")
    print(f"Bookings: {Booking.objects.count()}")
    print(f"Payments SUCCESS: {Payment.objects.filter(payment_status=Payment.PaymentStatus.SUCCESS).count()}")
    print(f"Password for all seed users: {PASSWORD}")


def create_oauth_client():
    print("=== Creating OAuth client ===")

    Application.objects.update_or_create(
        client_id=settings.OAUTH_CLIENT_ID,
        defaults={
            "client_secret": settings.OAUTH_CLIENT_SECRET,
            "client_type": Application.CLIENT_CONFIDENTIAL,
            "authorization_grant_type": Application.GRANT_PASSWORD,
            "name": "KMTravel Mobile App",
        },
    )


@transaction.atomic
def seed_all():
    wipe_data()
    accounts = create_accounts()
    create_oauth_client()
    cities, categories = create_locations_and_categories()
    tours, hotels, transports = create_services(accounts["provider_verified"], cities, categories)
    create_bookings_and_payments(accounts["customers"], tours, hotels, transports)
    print_summary()


if __name__ == "__main__":
    seed_all()
