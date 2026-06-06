from rest_framework import serializers
from .models import Payment, Transaction
from bookings.serializers import BookingReadSerializer


class TransactionReadSerializer(serializers.ModelSerializer):
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'payment', 'amount', 'currency',
            'transaction_type', 'transaction_type_display',
            'description', 'metadata', 'created_at',
        ]


class PaymentReadSerializer(serializers.ModelSerializer):
    booking = BookingReadSerializer(read_only=True)
    transaction_type_display = serializers.CharField(source='get_payment_status_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'booking', 'payment_method', 'payment_status',
            'transaction_type_display', 'amount', 'currency',
            'transaction_id', 'payment_url', 'provider_transaction_id',
            'paid_at', 'refund_amount', 'metadata', 'expires_at',
            'created_at', 'updated_at',
        ]


class PaymentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['booking', 'payment_method']

    def validate_booking(self, booking):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("User must be authenticated.")

        if booking.user_id != request.user.id:
            raise serializers.ValidationError("You can only create payment for your own booking.")

        if booking.payment_status == 'paid':
            raise serializers.ValidationError("Booking is already paid.")

        return booking


# ==================== Admin Dashboard Serializers ====================
class AdminDashboardSummarySerializer(serializers.Serializer):
    paid_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    success_payment_count = serializers.IntegerField()
    pending_payment_count = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    pending_provider_count = serializers.IntegerField()
    total_services = serializers.IntegerField()
    active_service_count = serializers.IntegerField()
    inactive_service_count = serializers.IntegerField()


class RevenueByServiceTypeSerializer(serializers.Serializer):
    type = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    bookings = serializers.IntegerField()


class AdminDashboardSerializer(serializers.Serializer):
    summary = AdminDashboardSummarySerializer()
    booking_status_counts = serializers.DictField(child=serializers.IntegerField())
    payment_status_counts = serializers.DictField(child=serializers.IntegerField())
    revenue_by_service_type = RevenueByServiceTypeSerializer(many=True)
    recent_pending_payments = serializers.ListField()