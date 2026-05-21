param(
    [string]$PythonCommand = "..\venv\Scripts\python.exe"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Split-Path -Parent $scriptDir
$managePy = Join-Path $backendDir "manage.py"

if (-not (Test-Path $managePy)) {
    throw "Khong tim thay manage.py tai: $managePy"
}

$tempPy = Join-Path $env:TEMP "seed_services_data.py"

$pythonSeedScript = @'
from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from locations.models import Country, City
from services.models import (
    Category,
    TravelTour,
    Hotel,
    Transport,
    RoomType,
    Room,
    Route,
    Package,
    TourPackage,
    SeatType,
    PhysicalSeat,
    SeatStatus,
)

User = get_user_model()


def ensure_provider():
    user, created = User.objects.get_or_create(
        username="seed_provider",
        defaults={
            "email": "seed_provider@example.com",
            "is_provider": True,
            "is_customer": False,
            "is_approved": True,
        },
    )
    if created:
        user.set_password("Seed@12345")
        user.save(update_fields=["password"])
    else:
        changed = False
        if not user.is_provider:
            user.is_provider = True
            changed = True
        if not user.is_approved:
            user.is_approved = True
            changed = True
        if changed:
            user.save(update_fields=["is_provider", "is_approved"])
    return user


def ensure_locations():
    country, _ = Country.objects.get_or_create(name="Vietnam")
    city_names = ["Da Nang", "Hoi An", "Hue", "Nha Trang", "Da Lat"]
    cities = []
    for city_name in city_names:
        city, _ = City.objects.get_or_create(name=city_name, country=country)
        cities.append(city)
    return cities


def ensure_categories():
    tour_cat, _ = Category.objects.get_or_create(name="Tour")
    hotel_cat, _ = Category.objects.get_or_create(name="Hotel")
    transport_cat, _ = Category.objects.get_or_create(name="Transport")
    return tour_cat, hotel_cat, transport_cat


def dedupe_then_update_or_create(model, lookup, defaults):
    """Remove duplicate records, then update_or_create."""
    qs = model.objects.filter(**lookup)
    count = qs.count()
    if count > 1:
        keep = qs.first()
        qs.exclude(pk=keep.pk).delete()
    return model.objects.update_or_create(defaults=defaults, **lookup)


def seed_tours(provider, cities, category):
    now = timezone.now()
    tours = []
    for i in range(1, 6):
        city = cities[(i - 1) % len(cities)]
        tour, _ = dedupe_then_update_or_create(
            TravelTour,
            lookup={"name": f"Seed Tour {i}", "provider": provider, "city": city},
            defaults={
                "description": f"Tour sample #{i} seeded by script.",
                "star_rating": Decimal("4.5"),
                "base_price": Decimal("1290000.00") + Decimal(i * 150000),
                "is_active": True,
                "category": category,
                "time_start": now + timedelta(days=i),
                "empty_slot": 20 + i,
            },
        )
        tours.append(tour)
    return tours


def seed_hotels(provider, cities, category):
    hotels = []
    for i in range(1, 6):
        city = cities[(i - 1) % len(cities)]
        hotel, _ = dedupe_then_update_or_create(
            Hotel,
            lookup={"name": f"Seed Hotel {i}", "provider": provider, "city": city},
            defaults={
                "description": f"Hotel sample #{i} seeded by script.",
                "star_rating": Decimal("4.2"),
                "base_price": Decimal("890000.00") + Decimal(i * 90000),
                "is_active": True,
                "category": category,
                "address_detail": f"{100 + i} Seed Street",
            },
        )
        hotels.append(hotel)
    return hotels


def seed_transports(provider, cities, category):
    vehicle_types = ["Bus", "Van", "Limousine", "Train", "Flight"]
    transports = []
    for i in range(1, 6):
        city = cities[(i - 1) % len(cities)]
        transport, _ = dedupe_then_update_or_create(
            Transport,
            lookup={"name": f"Seed Transport {i}", "provider": provider, "city": city},
            defaults={
                "description": f"Transport sample #{i} seeded by script.",
                "star_rating": Decimal("4.0"),
                "base_price": Decimal("290000.00") + Decimal(i * 50000),
                "is_active": True,
                "category": category,
                "brand_name": f"Seed Mobility {i}",
                "license_plate": f"43A-10{i:02d}",
                "vehicle_type": vehicle_types[(i - 1) % len(vehicle_types)],
            },
        )
        transports.append(transport)
    return transports


def seed_tour_packages(tours):
    package_names = ["Standard", "Premium", "VIP"]
    package_objs = []
    for package_name in package_names:
        package, _ = Package.objects.get_or_create(name=package_name)
        package_objs.append(package)

    for i, tour in enumerate(tours, start=1):
        tour_package, _ = TourPackage.objects.update_or_create(
            tour=tour,
            name=f"Bundle {i}",
            defaults={
                "price": tour.base_price + Decimal("250000.00"),
            },
        )
        tour_package.packages.set(package_objs[: ((i % len(package_objs)) + 1)])


def seed_hotel_rooms(hotels):
    for i, hotel in enumerate(hotels, start=1):
        standard_type, _ = RoomType.objects.update_or_create(
            hotel=hotel,
            name="Standard",
            defaults={"price": hotel.base_price},
        )
        deluxe_type, _ = RoomType.objects.update_or_create(
            hotel=hotel,
            name="Deluxe",
            defaults={"price": hotel.base_price + Decimal("250000.00")},
        )

        Room.objects.update_or_create(
            hotel=hotel,
            room_type=standard_type,
            room_number=f"S{i}01",
            defaults={"is_available": True, "total_beds": 1},
        )
        Room.objects.update_or_create(
            hotel=hotel,
            room_type=deluxe_type,
            room_number=f"D{i}01",
            defaults={"is_available": True, "total_beds": 2},
        )


def seed_transport_routes(transports, cities, seat_type_objs):
    now = timezone.now()
    for i, transport in enumerate(transports):
        # Create 10 physical seats per transport
        seats = []
        for seat_num in range(1, 11):
            seat_type = seat_type_objs[(seat_num - 1) % len(seat_type_objs)]
            seat, _ = PhysicalSeat.objects.update_or_create(
                transport=transport,
                seat_number=f"A{seat_num}",
                defaults={"seat_type": seat_type},
            )
            seats.append(seat)

        # Create 2 routes per transport
        for j in range(2):
            from_city = cities[(i + j) % len(cities)]
            to_city = cities[(i + j + 1) % len(cities)]
            departure_time = now + timedelta(days=i + j + 1, hours=8 + j * 4)
            arrival_time = departure_time + timedelta(hours=2)

            route, _ = Route.objects.update_or_create(
                transport=transport,
                from_city=from_city,
                to_city=to_city,
                defaults={
                    "departure_time": departure_time,
                    "arrival_time": arrival_time,
                },
            )

            # Create available seat statuses for this route
            for seat in seats:
                SeatStatus.objects.update_or_create(
                    route=route,
                    physical_seat=seat,
                    defaults={"status": SeatStatus.Status.AVAILABLE},
                )


def seed_seat_types(provider):
    economy, _ = SeatType.objects.update_or_create(
        provider=provider,
        name="Economy",
        defaults={"price": Decimal("90000.00")},
    )
    business, _ = SeatType.objects.update_or_create(
        provider=provider,
        name="Business",
        defaults={"price": Decimal("180000.00")},
    )
    return [economy, business]


def main():
    provider = ensure_provider()
    cities = ensure_locations()
    tour_cat, hotel_cat, transport_cat = ensure_categories()

    tours = seed_tours(provider, cities, tour_cat)
    hotels = seed_hotels(provider, cities, hotel_cat)
    transports = seed_transports(provider, cities, transport_cat)
    seed_tour_packages(tours)
    seed_hotel_rooms(hotels)
    seat_type_objs = seed_seat_types(provider)
    seed_transport_routes(transports, cities, seat_type_objs)

    print("Seed completed:")
    print(" - 5 tours")
    print(" - 5 hotels")
    print(" - 5 transports")
    print(" - tour packages, room types/rooms, routes, seat types")
    print(f"Provider username: {provider.username}")


main()
'@

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($tempPy, $pythonSeedScript, $utf8NoBom)

Push-Location $backendDir
try {
    $tempPyEscaped = $tempPy -replace "\\", "\\\\"
    & $PythonCommand "manage.py" shell -c "exec(open(r'$tempPyEscaped', encoding='utf-8').read())"
}
finally {
    Pop-Location
    if (Test-Path $tempPy) {
        Remove-Item $tempPy -Force
    }
}
