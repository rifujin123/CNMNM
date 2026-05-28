from decimal import Decimal
from django.db.models import Count, Sum

from accounts.models import User
from bookings.models import Booking
from payments.models import Payment
from services.models import BaseService


class AdminDashboardService:
    @staticmethod
    def count_by_status(queryset, field_name, choices):
        data = {value: 0 for value, _label in choices}

        rows = queryset.values(field_name).annotate(total=Count("id"))
        for row in rows:
            data[row[field_name]] = row["total"]

        return data

    @staticmethod
    def revenue_for_type(success_payments, service_type):
        filters = {
            "tour": {"booking__service__traveltour__isnull": False},
            "hotel": {"booking__service__hotel__isnull": False},
            "transport": {"booking__service__transport__isnull": False},
        }

        queryset = success_payments.filter(**filters[service_type])

        return {
            "type": service_type,
            "revenue": queryset.aggregate(total=Sum("amount"))["total"] or Decimal("0.00"),
            "bookings": queryset.values("booking_id").distinct().count(),
        }

    @classmethod
    def get_admin_dashboard(cls):
        success_payments = Payment.objects.filter(
            payment_status=Payment.PaymentStatus.SUCCESS
        )

        pending_payments = Payment.objects.filter(
            payment_status__in=Payment.active_statuses()
        )

        services = BaseService.objects.all()

        return {
            "summary": {
                "paid_revenue": success_payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00"),
                "success_payment_count": success_payments.count(),
                "pending_payment_count": pending_payments.count(),
                "total_bookings": Booking.objects.count(),
                "pending_provider_count": User.objects.filter(
                    is_provider=True,
                    is_approved=False,
                    provider_profile__is_rejected=False,
                ).count(),
                "total_services": services.count(),
                "active_service_count": services.filter(is_active=True).count(),
                "inactive_service_count": services.filter(is_active=False).count(),
            },
            "booking_status_counts": cls.count_by_status(
                Booking.objects.all(),
                "booking_status",
                Booking.BookingStatus.choices,
            ),
            "payment_status_counts": cls.count_by_status(
                Payment.objects.all(),
                "payment_status",
                Payment.PaymentStatus.choices,
            ),
            "revenue_by_service_type": [
                cls.revenue_for_type(success_payments, "tour"),
                cls.revenue_for_type(success_payments, "hotel"),
                cls.revenue_for_type(success_payments, "transport"),
            ],
            "recent_pending_payments": [
                {
                    "id": payment.id,
                    "booking": payment.booking_id,
                    "amount": payment.amount,
                    "currency": payment.currency,
                    "payment_status": payment.payment_status,
                    "created_at": payment.created_at,
                }
                for payment in pending_payments.order_by("-created_at")[:5]
            ],
        }