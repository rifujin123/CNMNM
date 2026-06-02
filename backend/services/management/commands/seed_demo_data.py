from datetime import timedelta
from decimal import Decimal

import cloudinary.uploader
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from django.utils import timezone
from oauth2_provider.models import Application

from accounts.models import ProviderProfile
from bookings.models import Booking
from locations.models import City, Country
from payments.models import Payment
from services.models import (
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


FRONTEND_CLIENT_ID = "geyWx8lpJCJIzICzeHuap5VDMCAmpBYq95VTmxHz"
FRONTEND_CLIENT_SECRET = (
    "ln5SkGgxG14NvWnOCEbIEkjpdo3zK0QopUN84ris80HaJV0b3u31huVqGv0Be95oVOkUxvchUQTCl2MN8v85FNPQ95nB7yoWm6CD6nq2yV1flp05OwLp92uJteaoA4B4"
)

SERVICE_IMAGE_URLS = {
    "tour": [
        "https://images.unsplash.com/photo-1723142282970-1fd415eec1ad?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1690960644375-6f2399a08ebc?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1664333039578-28ad613ee536?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1626608017817-211d7c48177d?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1689326232193-d55f0b7965eb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16?q=80&w=1786&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1694475495121-cf6b8e57f219?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    "hotel": [
        "https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1320&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1621293954908-907159247fc8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1675745329954-9639d3b74bbf?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    "transport": [
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1699152866040-e2915059c40f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1495150434753-f8ceb319e9dc?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1527295110-5145f6b148d0?q=80&w=1131&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
}

SERVICE_IMAGE_FOLDERS = {
    "tour": "media/services/tours",
    "hotel": "media/services/hotels",
    "transport": "media/services/transports",
}

SERVICE_IMAGE_DB_PATHS = {
    "tour": "services/tours",
    "hotel": "services/hotels",
    "transport": "services/transports",
}


class Command(BaseCommand):
    help = "Seed demo data for users, OAuth, locations, services, bookings, and reports."

    def handle(self, *args, **options):
        with transaction.atomic():
            admin = self.ensure_admin()
            customers = self.ensure_customers()
            provider = self.ensure_provider()
            self.ensure_pending_providers()
            self.ensure_oauth_application(admin)

            cities = self.ensure_locations()
            categories = self.ensure_categories()

            tours = self.seed_tours(provider, cities, categories["tour"])
            hotels = self.seed_hotels(provider, cities, categories["hotel"])
            transports = self.seed_transports(provider, cities, categories["transport"])

            self.seed_tour_packages(tours)
            self.seed_hotel_rooms(hotels)
            self.seed_transport_inventory(provider, transports, cities)
            self.seed_service_images([*tours, *hotels, *transports])
            self.seed_promo_banners()
            self.seed_demo_activity(customers, tours, hotels, transports)

        self.stdout.write(self.style.SUCCESS("Seed demo data completed."))
        self.stdout.write("Accounts:")
        self.stdout.write(" - admin / Admin@12345")
        self.stdout.write(" - demo_customer / Customer@12345")
        self.stdout.write(" - demo_customer_2 / Customer@12345")
        self.stdout.write(" - demo_customer_3 / Customer@12345")
        self.stdout.write(" - demo_provider / Provider@12345")
        self.stdout.write(" - pending_provider / Provider@12345")
        self.stdout.write("OAuth client:")
        self.stdout.write(f" - client_id: {FRONTEND_CLIENT_ID}")
        self.stdout.write("Created 10 tours, 10 hotels, 10 transports, demo bookings, payments, comments, and wishlists.")
        self.stdout.write("Service images are uploaded to Cloudinary from configured remote URLs.")

    def ensure_admin(self):
        User = get_user_model()
        user, _ = User.objects.get_or_create(
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
        user.first_name = "System"
        user.last_name = "Admin"
        user.is_staff = True
        user.is_superuser = True
        user.is_customer = False
        user.is_provider = False
        user.is_approved = True
        user.avatar = "profiles/LogoTravelBooking.png"
        user.set_password("Admin@12345")
        user.save()
        return user

    def ensure_customer(self, username, email, first_name, last_name):
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "is_customer": True,
                "is_provider": False,
                "is_approved": True,
            },
        )
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.is_customer = True
        user.is_provider = False
        user.is_staff = False
        user.is_superuser = False
        user.is_approved = True
        user.avatar = "profiles/customer-flow-avatar.png"
        user.set_password("Customer@12345")
        user.save()
        return user

    def ensure_customers(self):
        specs = [
            ("demo_customer", "customer@example.com", "Demo", "Customer"),
            ("demo_customer_2", "customer2@example.com", "Linh", "Nguyen"),
            ("demo_customer_3", "customer3@example.com", "Minh", "Tran"),
        ]
        return [self.ensure_customer(*spec) for spec in specs]

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
        user.is_staff = False
        user.is_superuser = False
        user.is_approved = True
        user.avatar = "profiles/verified-provider-license.png"
        user.set_password("Provider@12345")
        user.save()

        ProviderProfile.objects.update_or_create(
            user=user,
            defaults={
                "business_name": "Demo Travel Provider",
                "business_license": "licenses/provider-license.png",
                "tax_code": "DEMO-TAX-001",
                "is_verified": True,
                "is_rejected": False,
            },
        )
        return user

    def ensure_pending_providers(self):
        User = get_user_model()
        provider_specs = [
            (
                "pending_provider",
                "pending-provider@example.com",
                "Pending",
                "Provider",
                "Pending Travel Co.",
                "PENDING-TAX-001",
                "licenses/pending-provider-license.png",
                False,
            ),
            (
                "rejected_provider",
                "rejected-provider@example.com",
                "Rejected",
                "Provider",
                "Rejected Travel Co.",
                "REJECT-TAX-001",
                "licenses/other-provider-license.png",
                True,
            ),
        ]

        for username, email, first_name, last_name, business, tax_code, license_path, is_rejected in provider_specs:
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_customer": False,
                    "is_provider": True,
                    "is_approved": False,
                },
            )
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.is_customer = False
            user.is_provider = True
            user.is_staff = False
            user.is_superuser = False
            user.is_approved = False
            user.avatar = "profiles/pending-provider-avatar.png"
            user.set_password("Provider@12345")
            user.save()

            ProviderProfile.objects.update_or_create(
                user=user,
                defaults={
                    "business_name": business,
                    "business_license": license_path,
                    "tax_code": tax_code,
                    "is_verified": False,
                    "is_rejected": is_rejected,
                },
            )

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
        city_names = [
            "Da Nang",
            "Hoi An",
            "Hue",
            "Nha Trang",
            "Da Lat",
            "Ha Noi",
            "Ho Chi Minh City",
            "Phu Quoc",
            "Sa Pa",
            "Ha Long",
            "Can Tho",
            "Quy Nhon",
        ]
        cities = []
        for name in city_names:
            city, _ = City.objects.get_or_create(country=country, name=name)
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
        city_map = {city.name: city for city in cities}
        tour_specs = [
            ("Demo Tour Da Nang Beach Escape", "Da Nang", "Beach, seafood market, and Son Tra viewpoint.", "4.8", "1350000", 28),
            ("Demo Tour Hoi An Lantern Night", "Hoi An", "Old town walk, lantern boat, and local dinner.", "4.9", "1550000", 24),
            ("Demo Tour Hue Heritage Trail", "Hue", "Imperial City, royal tombs, and Perfume River.", "4.6", "1250000", 26),
            ("Demo Tour Da Lat Nature Camp", "Da Lat", "Waterfalls, pine forest, coffee farm, and campfire.", "4.7", "1450000", 20),
            ("Demo Tour Nha Trang Island Hop", "Nha Trang", "Snorkeling, island lunch, and coastal sunset.", "4.5", "1650000", 30),
            ("Demo Tour Ha Noi Culture Walk", "Ha Noi", "Old Quarter, museums, street food, and train street.", "4.4", "990000", 32),
            ("Demo Tour Phu Quoc Sunset Cruise", "Phu Quoc", "Cable car, beach time, and sunset cruise.", "4.8", "1890000", 22),
            ("Demo Tour Sa Pa Mountain Trek", "Sa Pa", "Rice terraces, village trek, and mountain homestay.", "4.7", "2100000", 18),
            ("Demo Tour Ha Long Bay Day Cruise", "Ha Long", "Limestone bay cruise, cave visit, and kayaking.", "4.9", "2250000", 34),
            ("Demo Tour Can Tho Floating Market", "Can Tho", "Floating market, orchard visit, and Mekong lunch.", "4.6", "1190000", 25),
        ]

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
        package_names = [
            "Breakfast",
            "Local guide",
            "Travel insurance",
            "Private transfer",
            "Photo support",
            "Premium meal",
        ]
        add_ons = []
        for name in package_names:
            package, _ = Package.objects.get_or_create(name=f"Demo {name}")
            add_ons.append(package)

        for index, tour in enumerate(tours, start=1):
            standard, _ = TourPackage.objects.update_or_create(
                tour=tour,
                name="Standard",
                defaults={"price": Decimal("0")},
            )
            standard.packages.set(add_ons[:2])

            comfort, _ = TourPackage.objects.update_or_create(
                tour=tour,
                name="Comfort",
                defaults={"price": Decimal("250000") + Decimal(index * 20000)},
            )
            comfort.packages.set(add_ons[:4])

            premium, _ = TourPackage.objects.update_or_create(
                tour=tour,
                name="Premium",
                defaults={"price": Decimal("550000") + Decimal(index * 30000)},
            )
            premium.packages.set(add_ons)

    def seed_hotels(self, provider, cities, category):
        city_map = {city.name: city for city in cities}
        hotel_specs = [
            ("Demo Ocean Breeze Hotel", "Da Nang", "Beachfront hotel near My Khe with sea-view rooms.", "4.6", "890000", "12 Vo Nguyen Giap"),
            ("Demo Lantern Boutique Hotel", "Hoi An", "Boutique stay close to the old town and night market.", "4.7", "760000", "88 Tran Phu"),
            ("Demo Imperial Garden Hotel", "Hue", "Quiet hotel near Hue Imperial City and Perfume River.", "4.4", "680000", "21 Le Loi"),
            ("Demo Highland Pine Resort", "Da Lat", "Cozy resort among pine hills with garden cafe.", "4.5", "920000", "9 Hoang Dieu"),
            ("Demo Coral Bay Hotel", "Nha Trang", "Modern hotel near the beach and sailing club.", "4.3", "810000", "46 Tran Phu"),
            ("Demo Old Quarter Stay", "Ha Noi", "Compact city hotel for food walks and museum visits.", "4.2", "650000", "15 Hang Bac"),
            ("Demo Sunset Island Resort", "Phu Quoc", "Island resort with pool, beach bar, and sunset view.", "4.8", "1780000", "7 Tran Hung Dao"),
            ("Demo Mountain View Lodge", "Sa Pa", "Mountain lodge overlooking terraces and Fansipan range.", "4.6", "990000", "5 Cau May"),
            ("Demo Bay Pearl Hotel", "Ha Long", "Hotel near cruise harbor with family rooms.", "4.5", "1050000", "2 Ha Long Road"),
            ("Demo Riverside Mekong Hotel", "Can Tho", "Riverside hotel close to Ninh Kieu pier.", "4.4", "730000", "19 Hai Ba Trung"),
        ]

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
                for room_index in range(1, 5):
                    Room.objects.update_or_create(
                        hotel=hotel,
                        room_number=f"{hotel_index:02d}{type_index}{room_index:02d}",
                        defaults={
                            "room_type": room_type,
                            "is_available": True,
                            "total_beds": beds,
                        },
                    )

    def seed_transports(self, provider, cities, category):
        city_map = {city.name: city for city in cities}
        transport_specs = [
            ("Demo Express Bus", "Da Nang", "Comfortable city-to-city bus with reclining seats.", "4.4", "220000", "Demo Express", "43B-10001"),
            ("Demo Coastal Limousine", "Nha Trang", "Premium limousine service for coastal routes.", "4.6", "390000", "Coastal Move", "79B-20002"),
            ("Demo Heritage Train", "Hue", "Scenic railway connection with reserved seats.", "4.3", "310000", "Heritage Rail", "SE-DEMO"),
            ("Demo Airport Shuttle", "Ha Noi", "Fast airport transfer shuttle for small groups.", "4.2", "180000", "Airport Link", "30A-30003"),
            ("Demo Island Ferry", "Phu Quoc", "Daily ferry transfer with luggage support.", "4.5", "260000", "Island Ferry", "PQ-40004"),
            ("Demo Night Sleeper Bus", "Ho Chi Minh City", "Overnight sleeper bus with blanket and water.", "4.1", "340000", "Night Line", "51B-50005"),
            ("Demo Mountain Van", "Sa Pa", "Shared mountain van with hotel pickup.", "4.4", "280000", "Mountain Go", "24B-60006"),
            ("Demo Bay Cruise Transfer", "Ha Long", "Transfer service from city center to cruise harbor.", "4.5", "230000", "Bay Transfer", "14B-70007"),
            ("Demo Mekong Coach", "Can Tho", "Intercity coach for Mekong Delta routes.", "4.2", "210000", "Mekong Coach", "65B-80008"),
            ("Demo City Private Car", "Quy Nhon", "Private car service for airport and beach routes.", "4.7", "520000", "City Private", "77A-90009"),
        ]

        transports = []
        for name, city_name, description, rating, price, brand, plate in transport_specs:
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
            for seat_number in range(1, 31):
                seat_type = seat_types[(seat_number - 1) % len(seat_types)]
                physical_seat, _ = PhysicalSeat.objects.update_or_create(
                    transport=transport,
                    seat_number=f"A{seat_number:02d}",
                    defaults={"seat_type": seat_type},
                )
                physical_seats.append(physical_seat)

            for route_index in range(2):
                from_city = cities[(transport_index + route_index) % len(cities)]
                to_city = cities[(transport_index + route_index + 1) % len(cities)]
                departure = now + timedelta(days=3 + transport_index, hours=8 + route_index * 5)
                arrival = departure + timedelta(hours=3 + route_index)

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

    def get_service_image_kind(self, service):
        if isinstance(service, TravelTour):
            return "tour"
        if isinstance(service, Hotel):
            return "hotel"
        if isinstance(service, Transport):
            return "transport"
        raise ValueError(f"Unsupported service type for image seed: {service.__class__.__name__}")

    def upload_service_image(self, service, kind, image_url):
        public_id = slugify(service.name)
        result = cloudinary.uploader.upload(
            image_url,
            folder=SERVICE_IMAGE_FOLDERS[kind],
            public_id=public_id,
            overwrite=True,
            resource_type="image",
        )
        return f"{SERVICE_IMAGE_DB_PATHS[kind]}/{public_id}"

    def seed_service_images(self, services):
        image_indexes = {kind: 0 for kind in SERVICE_IMAGE_URLS}
        for index, service in enumerate(services):
            kind = self.get_service_image_kind(service)
            image_urls = SERVICE_IMAGE_URLS[kind]
            image_url = image_urls[image_indexes[kind] % len(image_urls)]
            image_indexes[kind] += 1
            public_id = self.upload_service_image(service, kind, image_url)

            ServiceImage.objects.filter(service=service).delete()
            ServiceImage.objects.create(
                service=service,
                image=public_id,
                caption=f"Cloudinary demo {kind} image for {service.name}",
            )

    def seed_promo_banners(self):
        banners = [
            ("Summer in Da Nang", "Beach stays and city tours", "services/IMG_3480.JPG", "#0D9488", 1),
            ("Weekend in Hoi An", "Lantern nights and boutique hotels", "services/IMG_3457.PNG", "#2563EB", 2),
            ("Comfort Routes", "Book transport seats with live availability", "services/IMG_3461.JPG", "#F59E0B", 3),
        ]
        for title, subtitle, image_path, color, order in banners:
            PromoBanner.objects.update_or_create(
                title=title,
                defaults={
                    "subtitle": subtitle,
                    "image": image_path,
                    "cta_text": "Explore",
                    "background_color": color,
                    "is_active": True,
                    "display_order": order,
                },
            )

    def seed_demo_activity(self, customers, tours, hotels, transports):
        self.seed_comments_and_wishlists(customers, tours, hotels, transports)
        bookings = []
        bookings.extend(self.seed_tour_bookings(customers, tours))
        bookings.extend(self.seed_hotel_bookings(customers, hotels))
        bookings.extend(self.seed_transport_bookings(customers, transports))
        self.refresh_tour_inventory(tours, bookings)

    def seed_comments_and_wishlists(self, customers, tours, hotels, transports):
        review_texts = [
            "Good schedule and friendly support.",
            "Clear information, easy to book, and worth the price.",
            "Nice experience for a family demo flow.",
            "Convenient route and quick confirmation.",
            "Clean service data for testing the app screens.",
        ]

        for index, tour in enumerate(tours):
            customer = customers[index % len(customers)]
            Comment.objects.update_or_create(
                user=customer,
                travel_tour=tour,
                defaults={
                    "content": review_texts[index % len(review_texts)],
                    "rating": 4 + (index % 2),
                },
            )

        saved_services = [*tours[:4], *hotels[:3], *transports[:3]]
        for index, service in enumerate(saved_services):
            Wishlist.objects.get_or_create(
                user=customers[index % len(customers)],
                service=service,
            )

    def booking_state(self, index):
        states = [
            (Booking.BookingStatus.CONFIRMED, Booking.PaymentStatus.PAID, Payment.PaymentStatus.SUCCESS),
            (Booking.BookingStatus.PENDING, Booking.PaymentStatus.UNPAID, Payment.PaymentStatus.PROCESSING),
            (Booking.BookingStatus.COMPLETED, Booking.PaymentStatus.PAID, Payment.PaymentStatus.SUCCESS),
            (Booking.BookingStatus.PAYMENT_FAILED, Booking.PaymentStatus.FAILED, Payment.PaymentStatus.FAILED),
            (Booking.BookingStatus.CANCELLED, Booking.PaymentStatus.UNPAID, Payment.PaymentStatus.CANCELLED),
            (Booking.BookingStatus.CONFIRMED, Booking.PaymentStatus.PAID, Payment.PaymentStatus.SUCCESS),
            (Booking.BookingStatus.PENDING, Booking.PaymentStatus.UNPAID, Payment.PaymentStatus.REVIEW),
            (Booking.BookingStatus.EXPIRED, Booking.PaymentStatus.UNPAID, Payment.PaymentStatus.EXPIRED),
            (Booking.BookingStatus.REFUNDED, Booking.PaymentStatus.REFUNDED, Payment.PaymentStatus.REFUNDED),
            (Booking.BookingStatus.CONFIRMED, Booking.PaymentStatus.PAID, Payment.PaymentStatus.SUCCESS),
        ]
        return states[index % len(states)]

    def seed_tour_bookings(self, customers, tours):
        bookings = []
        for index, tour in enumerate(tours):
            customer = customers[index % len(customers)]
            tour_package = tour.tour_package.order_by("price", "id").first()
            quantity = 1 + (index % 3)
            total_price = (tour.base_price + tour_package.price) * quantity
            booking_status, payment_status, gateway_status = self.booking_state(index)

            booking, _ = Booking.objects.update_or_create(
                user=customer,
                service=tour,
                tour_package=tour_package,
                defaults={
                    "room_type": None,
                    "seat_type": None,
                    "route": None,
                    "quantity": quantity,
                    "total_price": total_price,
                    "booking_status": booking_status,
                    "payment_status": payment_status,
                    "expires_at": self.booking_expiry_for(booking_status),
                },
            )
            booking.rooms.clear()
            self.backdate_booking(booking, index)
            self.ensure_payment(booking, gateway_status, "TOUR", index)
            bookings.append(booking)
        return bookings

    def seed_hotel_bookings(self, customers, hotels):
        bookings = []
        for index, hotel in enumerate(hotels):
            customer = customers[(index + 1) % len(customers)]
            room_type = list(hotel.room_types.order_by("price", "id"))[index % 3]
            room_count = 1 + (index % 2)
            rooms = list(room_type.rooms.order_by("room_number")[:room_count])
            total_price = sum(room.room_type.price for room in rooms)
            booking_status, payment_status, gateway_status = self.booking_state(index + 2)

            booking, _ = Booking.objects.update_or_create(
                user=customer,
                service=hotel,
                room_type=room_type,
                defaults={
                    "seat_type": None,
                    "tour_package": None,
                    "route": None,
                    "quantity": len(rooms),
                    "total_price": total_price,
                    "booking_status": booking_status,
                    "payment_status": payment_status,
                    "expires_at": self.booking_expiry_for(booking_status),
                },
            )
            booking.rooms.set(rooms)
            self.apply_hotel_inventory(booking, rooms)
            self.backdate_booking(booking, index + 10)
            self.ensure_payment(booking, gateway_status, "HOTEL", index)
            bookings.append(booking)
        return bookings

    def seed_transport_bookings(self, customers, transports):
        bookings = []
        for index, transport in enumerate(transports):
            customer = customers[(index + 2) % len(customers)]
            route = transport.routes.order_by("departure_time", "id").first()
            seat_types = list(
                SeatType.objects.filter(
                    physical_seats__transport=transport,
                ).distinct().order_by("price", "id")
            )
            seat_type = seat_types[index % len(seat_types)]
            quantity = 1 + (index % 2)
            total_price = (transport.base_price + seat_type.price) * quantity
            booking_status, payment_status, gateway_status = self.booking_state(index + 4)

            booking, _ = Booking.objects.update_or_create(
                user=customer,
                service=transport,
                route=route,
                seat_type=seat_type,
                defaults={
                    "room_type": None,
                    "tour_package": None,
                    "quantity": quantity,
                    "total_price": total_price,
                    "booking_status": booking_status,
                    "payment_status": payment_status,
                    "expires_at": self.booking_expiry_for(booking_status),
                },
            )
            booking.rooms.clear()
            self.apply_transport_inventory(booking)
            self.backdate_booking(booking, index + 20)
            self.ensure_payment(booking, gateway_status, "TRANSPORT", index)
            bookings.append(booking)
        return bookings

    def booking_expiry_for(self, booking_status):
        if booking_status == Booking.BookingStatus.PENDING:
            return timezone.now() + timedelta(days=2)
        if booking_status == Booking.BookingStatus.EXPIRED:
            return timezone.now() - timedelta(hours=2)
        return None

    def payment_expiry_for(self, gateway_status):
        if gateway_status in Payment.active_statuses():
            return timezone.now() + timedelta(days=2)
        if gateway_status == Payment.PaymentStatus.EXPIRED:
            return timezone.now() - timedelta(hours=1)
        return None

    def backdate_booking(self, booking, index):
        created_at = timezone.now() - timedelta(hours=(index % 12) * 3)
        Booking.objects.filter(pk=booking.pk).update(
            created_date=created_at,
            updated_date=created_at,
        )
        booking.refresh_from_db()

    def ensure_payment(self, booking, gateway_status, prefix, index):
        paid_at = timezone.now() - timedelta(hours=index + 1) if gateway_status == Payment.PaymentStatus.SUCCESS else None
        provider_transaction_id = f"STATICQR-{prefix}-{index + 1:02d}" if gateway_status == Payment.PaymentStatus.SUCCESS else None
        gateway_label = {
            Payment.PaymentStatus.SUCCESS: "paid",
            Payment.PaymentStatus.PROCESSING: "processing",
            Payment.PaymentStatus.REVIEW: "review",
            Payment.PaymentStatus.FAILED: "failed",
            Payment.PaymentStatus.CANCELLED: "cancelled",
            Payment.PaymentStatus.EXPIRED: "expired",
            Payment.PaymentStatus.REFUNDED: "refunded",
        }.get(gateway_status, "pending")

        payment, _ = Payment.objects.update_or_create(
            transaction_id=f"DEMO-{prefix}-{index + 1:02d}",
            defaults={
                "user": booking.user,
                "booking": booking,
                "payment_method": Payment.PaymentMethod.STATIC_QR,
                "payment_status": gateway_status,
                "amount": booking.total_price,
                "currency": "VND",
                "payment_url": f"https://img.vietqr.io/image/DEMO-{prefix}-{index + 1:02d}.png",
                "provider_transaction_id": provider_transaction_id,
                "paid_at": paid_at,
                "refund_amount": booking.total_price if gateway_status == Payment.PaymentStatus.REFUNDED else None,
                "metadata": {
                    "seed": True,
                    "gateway": "STATIC_QR",
                    "gateway_status": gateway_label,
                    "service_type": prefix.lower(),
                },
                "expires_at": self.payment_expiry_for(gateway_status),
            },
        )

        payment_created_at = booking.created_date + timedelta(minutes=5)
        Payment.objects.filter(pk=payment.pk).update(
            created_at=payment_created_at,
            updated_at=payment_created_at,
        )
        payment.refresh_from_db()
        return payment

    def apply_hotel_inventory(self, booking, rooms):
        active_statuses = [
            Booking.BookingStatus.PENDING,
            Booking.BookingStatus.CONFIRMED,
            Booking.BookingStatus.COMPLETED,
        ]
        if booking.booking_status in active_statuses:
            Room.objects.filter(id__in=[room.id for room in rooms]).update(is_available=False)

    def apply_transport_inventory(self, booking):
        SeatStatus.objects.filter(booking=booking).update(
            status=SeatStatus.Status.AVAILABLE,
            booking=None,
        )

        if booking.booking_status not in [
            Booking.BookingStatus.PENDING,
            Booking.BookingStatus.CONFIRMED,
            Booking.BookingStatus.COMPLETED,
        ]:
            return

        seat_status = SeatStatus.Status.HELD
        if booking.booking_status in [
            Booking.BookingStatus.CONFIRMED,
            Booking.BookingStatus.COMPLETED,
        ]:
            seat_status = SeatStatus.Status.BOOKED

        seats = list(
            SeatStatus.objects.filter(
                route=booking.route,
                physical_seat__seat_type=booking.seat_type,
                status=SeatStatus.Status.AVAILABLE,
                booking__isnull=True,
            ).order_by("physical_seat__seat_number")[: booking.quantity]
        )
        SeatStatus.objects.filter(id__in=[seat.id for seat in seats]).update(
            status=seat_status,
            booking=booking,
        )

    def refresh_tour_inventory(self, tours, bookings):
        held_quantities = {tour.id: 0 for tour in tours}
        for booking in bookings:
            if not hasattr(booking.service, "traveltour"):
                continue
            if booking.booking_status in [
                Booking.BookingStatus.PENDING,
                Booking.BookingStatus.CONFIRMED,
                Booking.BookingStatus.COMPLETED,
            ]:
                held_quantities[booking.service_id] = held_quantities.get(booking.service_id, 0) + booking.quantity

        for tour in tours:
            initial_slots = {
                "Demo Tour Da Nang Beach Escape": 28,
                "Demo Tour Hoi An Lantern Night": 24,
                "Demo Tour Hue Heritage Trail": 26,
                "Demo Tour Da Lat Nature Camp": 20,
                "Demo Tour Nha Trang Island Hop": 30,
                "Demo Tour Ha Noi Culture Walk": 32,
                "Demo Tour Phu Quoc Sunset Cruise": 22,
                "Demo Tour Sa Pa Mountain Trek": 18,
                "Demo Tour Ha Long Bay Day Cruise": 34,
                "Demo Tour Can Tho Floating Market": 25,
            }[tour.name]
            tour.empty_slot = max(initial_slots - held_quantities.get(tour.id, 0), 1)
            tour.save(update_fields=["empty_slot"])
