from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from locations.models import City, Country
from services.models import Category, Hotel, Transport, TravelTour, Wishlist


class WishlistServiceAPITests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.customer = user_model.objects.create_user(
            username="wishlist-customer",
            email="wishlist-customer@example.com",
            password="pass12345",
            is_customer=True,
        )
        self.provider = user_model.objects.create_user(
            username="wishlist-provider",
            email="wishlist-provider@example.com",
            password="pass12345",
            is_provider=True,
            is_approved=True,
        )

        country = Country.objects.create(name="Vietnam")
        city = City.objects.create(name="Da Nang", country=country)
        tour_category = Category.objects.create(name="Tour")
        hotel_category = Category.objects.create(name="Hotel")
        transport_category = Category.objects.create(name="Transport")

        self.tour = TravelTour.objects.create(
            name="Beach Tour",
            description="A short beach trip",
            base_price=Decimal("100000.00"),
            city=city,
            provider=self.provider,
            category=tour_category,
            time_start=timezone.now() + timedelta(days=7),
            empty_slot=10,
        )
        self.hotel = Hotel.objects.create(
            name="City Hotel",
            description="Central stay",
            base_price=Decimal("500000.00"),
            city=city,
            provider=self.provider,
            category=hotel_category,
            address_detail="1 River Street",
        )
        self.transport = Transport.objects.create(
            name="Airport Shuttle",
            description="Airport transfer",
            base_price=Decimal("75000.00"),
            city=city,
            provider=self.provider,
            category=transport_category,
            brand_name="KM Travel",
            vehicle_type="Bus",
        )

        self.client.force_authenticate(user=self.customer)

    def test_can_save_hotel_and_transport_services(self):
        hotel_response = self.client.post(
            "/api/services/wishlist/",
            {"service_id": self.hotel.id},
            format="json",
        )
        transport_response = self.client.post(
            "/api/services/wishlist/",
            {"service_id": self.transport.id},
            format="json",
        )

        self.assertEqual(hotel_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(transport_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(hotel_response.data["service"]["type"], "hotel")
        self.assertEqual(transport_response.data["service"]["type"], "transport")

        list_response = self.client.get("/api/services/wishlist/")

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        saved_types = {item["service"]["type"] for item in list_response.data}
        self.assertEqual(saved_types, {"hotel", "transport"})

        delete_response = self.client.delete(
            f"/api/services/wishlist/remove/?service_id={self.transport.id}"
        )

        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Wishlist.objects.filter(user=self.customer, service=self.transport).exists()
        )

    def test_tour_id_payload_still_saves_tour(self):
        response = self.client.post(
            "/api/services/wishlist/",
            {"tour_id": self.tour.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["service"]["id"], self.tour.id)
        self.assertEqual(response.data["service"]["type"], "tour")
        self.assertEqual(response.data["travel_tour"]["id"], self.tour.id)
