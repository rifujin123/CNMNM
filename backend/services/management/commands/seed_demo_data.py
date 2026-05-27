from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from oauth2_provider.models import Application

from accounts.models import ProviderProfile
from locations.models import City, Country
from services.models import (
    Category,
    Hotel,
    Package,
    PhysicalSeat,
    PromoBanner,
    Room,
    RoomType,
    Route,
    SeatStatus,
    SeatType,
    TourPackage,
    Transport,
    TravelTour,
)


FRONTEND_CLIENT_ID = "geyWx8lpJCJIzICzeHuap5VDMCAmpBYq95VTmxHz"
FRONTEND_CLIENT_SECRET = (
    "ln5SkGgxG14NvWnOCEbIEkjpdo3zK0QopUN84ris80HaJV0b3u31huVqGv0Be95oVOkUxvchUQTCl2MN8v85FNPQ95nB7yoWm6CD6nq2yV1flp05OwLp92uJteaoA4B4"
)


class Command(BaseCommand):
    help = "Seed demo data for users, OAuth, locations, tours, hotels, and transports."

    def handle(self, *args, **options):
        with transaction.atomic():
            admin = self.ensure_admin()
            customer = self.ensure_customer()
            provider = self.ensure_provider()
            self.ensure_oauth_application(admin)

            cities = self.ensure_locations()
            categories = self.ensure_categories()

            tours = self.seed_tours(provider, cities, categories["tour"])
            hotels = self.seed_hotels(provider, cities, categories["hotel"])
            transports = self.seed_transports(provider, cities, categories["transport"])

            self.seed_tour_packages(tours)
            self.seed_hotel_rooms(hotels)
            self.seed_transport_inventory(provider, transports, cities)
            self.seed_promo_banners()

        self.stdout.write(self.style.SUCCESS("Seed demo data completed."))
        self.stdout.write("Accounts:")
        self.stdout.write(" - admin / Admin@12345")
        self.stdout.write(" - demo_customer / Customer@12345")
        self.stdout.write(" - demo_provider / Provider@12345")
        self.stdout.write("OAuth client:")
        self.stdout.write(f" - client_id: {FRONTEND_CLIENT_ID}")
        self.stdout.write("Created demo tours, hotels, transports, rooms, routes, and available seats.")

    def ensure_admin(self):
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@example.com",
                "is_staff": True,
                "is_superuser": True,
                "is_customer": False,
                "is_provider": False,
                "is_approved": True,
            },
        )
        user.email = "admin@example.com"
        user.is_staff = True
        user.is_superuser = True
        user.is_approved = True
        user.set_password("Admin@12345")
        user.save()
        return user

    def ensure_customer(self):
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username="demo_customer",
            defaults={
                "email": "customer@example.com",
                "first_name": "Demo",
                "last_name": "Customer",
                "is_customer": True,
                "is_provider": False,
                "is_approved": True,
            },
        )
        user.email = "customer@example.com"
        user.first_name = "Demo"
        user.last_name = "Customer"
        user.is_customer = True
        user.is_provider = False
        user.is_approved = True
        user.set_password("Customer@12345")
        user.save()
        return user

    def ensure_provider(self):
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username="demo_provider",
            defaults={
                "email": "provider@example.com",
                "first_name": "Demo",
                "last_name": "Provider",
                "is_customer": False,
                "is_provider": True,
                "is_approved": True,
            },
        )
        user.email = "provider@example.com"
        user.first_name = "Demo"
        user.last_name = "Provider"
        user.is_customer = False
        user.is_provider = True
        user.is_approved = True
        user.set_password("Provider@12345")
        user.save()

        ProviderProfile.objects.update_or_create(
            user=user,
            defaults={
                "business_name": "Demo Travel Provider",
                "business_license": "licenses/demo-provider-license.png",
                "tax_code": "DEMO-TAX-001",
                "is_verified": True,
            },
        )
        return user

    def ensure_oauth_application(self, admin):
        app, _ = Application.objects.update_or_create(
            client_id=FRONTEND_CLIENT_ID,
            defaults={
                "name": "Travel Booking Mobile Demo",
                "user": admin,
                "client_type": Application.CLIENT_CONFIDENTIAL,
                "authorization_grant_type": Application.GRANT_PASSWORD,
                "skip_authorization": True,
            },
        )
        app.client_secret = FRONTEND_CLIENT_SECRET
        app.save()
        return app

    def ensure_locations(self):
        country, _ = Country.objects.get_or_create(name="Vietnam")
        city_names = ["Da Nang", "Hoi An", "Hue", "Nha Trang", "Da Lat", "Ha Noi"]
        cities = []
        for name in city_names:
            city, _ = City.objects.get_or_create(
                country=country,
                name=name,
            )
            cities.append(city)
        return cities

    def ensure_categories(self):
        category_names = {
            "tour": "Tour",
            "hotel": "Hotel",
            "transport": "Transport",
        }
        return {
            key: Category.objects.get_or_create(name=name)[0]
            for key, name in category_names.items()
        }

    def seed_tours(self, provider, cities, category):
        now = timezone.now()
        tour_specs = [
            ("Demo Tour Da Nang Beach", "Da Nang", "Beach and seafood day tour.", "4.7", "1350000", 24),
            ("Demo Tour Hoi An Lantern", "Hoi An", "Old town, lanterns, and local cuisine.", "4.8", "1550000", 18),
            ("Demo Tour Hue Heritage", "Hue", "Imperial city and royal tombs.", "4.6", "1250000", 20),
            ("Demo Tour Da Lat Nature", "Da Lat", "Waterfalls, pine forest, and coffee farms.", "4.5", "1450000", 16),
        ]
        city_map = {city.name: city for city in cities}
        tours = []
        for index, (name, city_name, description, rating, price, slots) in enumerate(tour_specs, start=1):
            tour, _ = TravelTour.objects.update_or_create(
                name=name,
                provider=provider,
                defaults={
                    "description": description,
                    "star_rating": Decimal(rating),
                    "base_price": Decimal(price),
                    "is_active": True,
                    "city": city_map[city_name],
                    "category": category,
                    "time_start": now + timedelta(days=7 + index),
                    "empty_slot": slots,
                },
            )
            tours.append(tour)
        return tours

    def seed_tour_packages(self, tours):
        add_ons = []
        for name in ["Breakfast", "Guide", "Insurance", "Private transfer"]:
            package, _ = Package.objects.get_or_create(name=f"Demo {name}")
            add_ons.append(package)

        for index, tour in enumerate(tours, start=1):
            standard, _ = TourPackage.objects.update_or_create(
                tour=tour,
                name="Standard",
                defaults={"price": Decimal("0")},
            )
            standard.packages.set(add_ons[:2])

            premium, _ = TourPackage.objects.update_or_create(
                tour=tour,
                name="Premium",
                defaults={"price": Decimal("350000") + Decimal(index * 50000)},
            )
            premium.packages.set(add_ons)

    def seed_hotels(self, provider, cities, category):
        hotel_specs = [
            ("Demo Ocean Hotel", "Da Nang", "Beachfront hotel near My Khe.", "4.6", "890000", "12 Vo Nguyen Giap"),
            ("Demo Lantern Hotel", "Hoi An", "Boutique hotel close to the old town.", "4.7", "760000", "88 Tran Phu"),
            ("Demo Imperial Hotel", "Hue", "Quiet hotel near Hue Imperial City.", "4.4", "680000", "21 Le Loi"),
            ("Demo Highland Resort", "Da Lat", "Cozy resort among pine hills.", "4.5", "920000", "9 Hoang Dieu"),
        ]
        city_map = {city.name: city for city in cities}
        hotels = []
        for name, city_name, description, rating, price, address in hotel_specs:
            hotel, _ = Hotel.objects.update_or_create(
                name=name,
                provider=provider,
                defaults={
                    "description": description,
                    "star_rating": Decimal(rating),
                    "base_price": Decimal(price),
                    "is_active": True,
                    "city": city_map[city_name],
                    "category": category,
                    "address_detail": address,
                },
            )
            hotels.append(hotel)
        return hotels

    def seed_hotel_rooms(self, hotels):
        for hotel_index, hotel in enumerate(hotels, start=1):
            room_types = [
                ("Standard", hotel.base_price, 1),
                ("Deluxe", hotel.base_price + Decimal("350000"), 2),
                ("Family", hotel.base_price + Decimal("650000"), 3),
            ]
            for type_index, (name, price, beds) in enumerate(room_types, start=1):
                room_type, _ = RoomType.objects.update_or_create(
                    hotel=hotel,
                    name=name,
                    defaults={"price": price},
                )
                for room_index in range(1, 4):
                    Room.objects.update_or_create(
                        hotel=hotel,
                        room_number=f"{hotel_index}{type_index}{room_index:02d}",
                        defaults={
                            "room_type": room_type,
                            "is_available": True,
                            "total_beds": beds,
                        },
                    )

    def seed_transports(self, provider, cities, category):
        transport_specs = [
            ("Demo Express Bus", "Da Nang", "Comfortable city-to-city bus.", "4.4", "220000", "Demo Express", "43B-10001", "Bus"),
            ("Demo Coastal Limousine", "Nha Trang", "Premium limousine service.", "4.6", "390000", "Coastal Move", "79B-20002", "Limousine"),
            ("Demo Heritage Train", "Hue", "Scenic railway connection.", "4.3", "310000", "Heritage Rail", "SE-DEMO", "Train"),
            ("Demo Airport Shuttle", "Ha Noi", "Fast airport transfer shuttle.", "4.2", "180000", "Airport Link", "30A-30003", "Van"),
        ]
        city_map = {city.name: city for city in cities}
        transports = []
        for name, city_name, description, rating, price, brand, plate, vehicle_type in transport_specs:
            transport, _ = Transport.objects.update_or_create(
                name=name,
                provider=provider,
                defaults={
                    "description": description,
                    "star_rating": Decimal(rating),
                    "base_price": Decimal(price),
                    "is_active": True,
                    "city": city_map[city_name],
                    "category": category,
                    "brand_name": brand,
                    "license_plate": plate,
                    "vehicle_type": vehicle_type,
                },
            )
            transports.append(transport)
        return transports

    def seed_transport_inventory(self, provider, transports, cities):
        economy, _ = SeatType.objects.update_or_create(
            provider=provider,
            name="Demo Economy",
            defaults={"price": Decimal("0")},
        )
        business, _ = SeatType.objects.update_or_create(
            provider=provider,
            name="Demo Business",
            defaults={"price": Decimal("150000")},
        )
        vip, _ = SeatType.objects.update_or_create(
            provider=provider,
            name="Demo VIP",
            defaults={"price": Decimal("300000")},
        )
        seat_types = [economy, business, vip]

        now = timezone.now()
        for transport_index, transport in enumerate(transports):
            physical_seats = []
            for seat_number in range(1, 25):
                seat_type = seat_types[seat_number % len(seat_types)]
                physical_seat, _ = PhysicalSeat.objects.update_or_create(
                    transport=transport,
                    seat_number=f"A{seat_number:02d}",
                    defaults={"seat_type": seat_type},
                )
                physical_seats.append(physical_seat)

            for route_index in range(2):
                from_city = cities[(transport_index + route_index) % len(cities)]
                to_city = cities[(transport_index + route_index + 1) % len(cities)]
                departure = now + timedelta(days=3 + transport_index + route_index, hours=8 + route_index * 4)
                arrival = departure + timedelta(hours=3)

                route, _ = Route.objects.update_or_create(
                    transport=transport,
                    from_city=from_city,
                    to_city=to_city,
                    defaults={
                        "departure_time": departure,
                        "arrival_time": arrival,
                    },
                )

                for physical_seat in physical_seats:
                    SeatStatus.objects.update_or_create(
                        route=route,
                        physical_seat=physical_seat,
                        defaults={
                            "status": SeatStatus.Status.AVAILABLE,
                            "booking": None,
                        },
                    )

    def seed_promo_banners(self):
        banners = [
            ("Summer in Da Nang", "Beach stays and city tours", "#0D9488", 1),
            ("Weekend in Hoi An", "Lantern nights and boutique hotels", "#2563EB", 2),
            ("Comfort Routes", "Book transport seats with live availability", "#F59E0B", 3),
        ]
        for title, subtitle, color, order in banners:
            PromoBanner.objects.update_or_create(
                title=title,
                defaults={
                    "subtitle": subtitle,
                    "image": "promo_banners/demo-banner.png",
                    "cta_text": "Explore",
                    "background_color": color,
                    "is_active": True,
                    "display_order": order,
                },
            )
