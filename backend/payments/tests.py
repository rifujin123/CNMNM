from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from bookings.models import Booking
from locations.models import City, Country
from services.models import Category, TourPackage, TravelTour


class PaymentCreateAPITests(APITestCase):
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
        tour = TravelTour.objects.create(
            name="Mekong Tour",
            description="Day trip",
            base_price=Decimal("200000.00"),
            city=city,
            provider=self.provider,
            category=category,
            time_start=timezone.now() + timedelta(days=10),
            empty_slot=4,
        )
        package = TourPackage.objects.create(
            tour=tour,
            name="Standard",
            price=Decimal("100000.00"),
        )
        self.booking = Booking.objects.create(
            user=self.customer,
            service=tour,
            tour_package=package,
            quantity=1,
            total_price=Decimal("300000.00"),
            booking_status=Booking.BookingStatus.PENDING,
            payment_status=Booking.PaymentStatus.UNPAID,
        )

        self.client.force_authenticate(user=self.customer)

    def test_create_payment_returns_read_payload_and_blocks_duplicate_active_payment(self):
        response = self.client.post(
            "/api/payments/",
            {
                "booking": self.booking.id,
                "payment_method": "STATIC_QR",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertEqual(response.data["booking"], self.booking.id)
        self.assertEqual(response.data["amount"], "300000.00")
        self.assertEqual(response.data["payment_status"], "PROCESSING")
        self.assertEqual(response.data["payment_method"], "STATIC_QR")
        self.assertIn("transaction_id", response.data)
        self.assertEqual(
            response.data["metadata"]["transfer_content"],
            response.data["transaction_id"],
        )

        duplicate_response = self.client.post(
            "/api/payments/",
            {
                "booking": self.booking.id,
                "payment_method": "STATIC_QR",
            },
            format="json",
        )

        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
