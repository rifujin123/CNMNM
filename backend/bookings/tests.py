from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from locations.models import City, Country
from services.models import Category, TourPackage, TravelTour


class BookingCreateAPITests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.customer = user_model.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="pass12345",
            is_customer=True,
        )
        self.provider = user_model.objects.create_user(
            username="provider",
            email="provider@example.com",
            password="pass12345",
            is_provider=True,
            is_approved=True,
        )

        country = Country.objects.create(name="Vietnam")
        city = City.objects.create(name="Ho Chi Minh", country=country)
        category = Category.objects.create(name="Tour")
        self.tour = TravelTour.objects.create(
            name="Cu Chi Tour",
            description="Half day tour",
            base_price=Decimal("100000.00"),
            city=city,
            provider=self.provider,
            category=category,
            time_start=timezone.now() + timedelta(days=7),
            empty_slot=5,
        )
        self.package = TourPackage.objects.create(
            tour=self.tour,
            name="Standard",
            price=Decimal("50000.00"),
        )

        self.client.force_authenticate(user=self.customer)

    def test_create_booking_uses_default_create_flow_and_returns_read_payload(self):
        response = self.client.post(
            "/api/bookings/",
            {
                "service": self.tour.id,
                "tour_package": self.package.id,
                "quantity": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertEqual(response.data["booking_status"], "pending")
        self.assertEqual(response.data["payment_status"], "unpaid")
        self.assertEqual(Decimal(response.data["total_price"]), Decimal("300000.00"))

        self.tour.refresh_from_db()
        self.assertEqual(self.tour.empty_slot, 3)
