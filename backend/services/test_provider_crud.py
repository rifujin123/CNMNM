from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from locations.models import City, Country
from services.models import Category, TravelTour, Hotel, Transport


class ProviderServiceCRUDTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.provider = User.objects.create_user(
            username="test-provider",
            email="provider@test.com",
            password="pass12345",
            is_provider=True,
            is_approved=True,
        )

        country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Hanoi", country=country)
        self.tour_category = Category.objects.create(name="Tour")
        self.hotel_category = Category.objects.create(name="Hotel")
        self.transport_category = Category.objects.create(name="Transport")

        self.client.force_authenticate(user=self.provider)

    def test_create_tour(self):
        payload = {
            "name": "Ha Long Bay Tour",
            "description": "Beautiful bay tour",
            "base_price": "500000",
            "city": self.city.id,
            "time_start": (timezone.now() + timedelta(days=10)).isoformat(),
            "empty_slot": 20,
        }

        response = self.client.post("/api/services/travel-tours/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Ha Long Bay Tour")

    def test_update_tour(self):
        tour = TravelTour.objects.create(
            name="Old Tour",
            description="Old desc",
            base_price=Decimal("100000"),
            city=self.city,
            category=self.tour_category,
            provider=self.provider,
            time_start=timezone.now() + timedelta(days=5),
            empty_slot=10,
        )

        payload = {
            "name": "Updated Tour",
            "description": "New desc",
            "base_price": "200000",
            "city": self.city.id,
            "time_start": (timezone.now() + timedelta(days=7)).isoformat(),
            "empty_slot": 15,
        }

        response = self.client.put(f"/api/services/travel-tours/{tour.id}/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Updated Tour")
        self.assertEqual(response.data["empty_slot"], 15)

    def test_delete_tour(self):
        tour = TravelTour.objects.create(
            name="Delete Me",
            description="Will be deleted",
            base_price=Decimal("100000"),
            city=self.city,
            category=self.tour_category,
            provider=self.provider,
            time_start=timezone.now() + timedelta(days=5),
            empty_slot=10,
        )

        response = self.client.delete(f"/api/services/travel-tours/{tour.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TravelTour.objects.filter(id=tour.id).exists())

    def test_create_hotel(self):
        payload = {
            "name": "Luxury Hotel",
            "description": "5 star hotel",
            "base_price": "1000000",
            "city": self.city.id,
            "address_detail": "123 Main St",
        }

        response = self.client.post("/api/services/hotels/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Luxury Hotel")

    def test_create_transport(self):
        payload = {
            "name": "Airport Bus",
            "description": "Fast transfer",
            "base_price": "50000",
            "city": self.city.id,
            "brand_name": "KM Travel",
            "vehicle_type": "Bus",
            "license_plate": "29A-12345",
        }

        response = self.client.post("/api/services/transports/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["brand_name"], "KM Travel")

    def test_unapproved_provider_cannot_create(self):
        User = get_user_model()
        unapproved = User.objects.create_user(
            username="unapproved",
            email="unapproved@test.com",
            password="pass12345",
            is_provider=True,
            is_approved=False,
        )

        self.client.force_authenticate(user=unapproved)

        payload = {
            "name": "Test Tour",
            "description": "Test",
            "base_price": "100000",
            "city": self.city.id,
            "time_start": (timezone.now() + timedelta(days=5)).isoformat(),
            "empty_slot": 10,
        }

        response = self.client.post("/api/services/travel-tours/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)