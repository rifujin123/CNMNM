from rest_framework import serializers
from bookings.models import Booking
from .models import Payment
from .payServices.payment_service import create_gateway_payment
import uuid
from django.db import transaction

# import to Set expires_at
from datetime import timedelta
from django.conf import settings
from django.utils import timezone

class PaymentReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "booking",
            "payment_method",
            "payment_status",
            "amount",
            "currency",
            "transaction_id",
            "payment_url",
            "provider_transaction_id",
            "metadata",
            "paid_at",
            "expires_at",
            "refund_amount",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class PaymentCreateSerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(queryset= Booking.objects.all())

    class Meta:
        model = Payment
        fields = [
            "booking",
            "payment_method",
        ]

    def validate_payment_method(self, payment_method):
        if payment_method != Payment.PaymentMethod.STATIC_QR:
            raise serializers.ValidationError(
                "Hien tai chi ho tro thanh toan Static QR."
            )

        return payment_method
        
    def validate_booking(self, booking):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Người dùng chưa đăng nhập")

        if booking.user_id != request.user.id:
            raise serializers.ValidationError("Bạn chỉ có thể tạo thanh toán cho các đơn đặt chỗ này.")

        if booking.payment_status == Booking.PaymentStatus.PAID:
            raise serializers.ValidationError("Booking này đã được thanh toán.")
        
        if booking.booking_status == Booking.BookingStatus.CANCELLED:
            raise serializers.ValidationError("Booking này đã bị hủy, không thể thanh toán.")
        
        if booking.booking_status == Booking.BookingStatus.EXPIRED:
            raise serializers.ValidationError("Booking này đã hết hạn, không thể thanh toán.")
        
        if booking.booking_status == Booking.BookingStatus.REFUNDED:
            raise serializers.ValidationError("Booking này đã được hoàn tiền, không thể thanh toán.")
        
        if booking.booking_status == Booking.BookingStatus.COMPLETED:
            raise serializers.ValidationError("Booking này đã hoàn thành, không thể thanh toán.")
        
        if booking.booking_status == Booking.BookingStatus.PAYMENT_FAILED:
            raise serializers.ValidationError("Booking này không thể thanh toán.")
        
        existing_active_payment = Payment.objects.filter(
            booking=booking,
            payment_status__in=Payment.active_statuses(),
        ).exists()
        
        if existing_active_payment:
            raise serializers.ValidationError("Đã có một thanh toán đang chờ xử lý cho booking này.")

        return booking
    
    def create(self, validated_data):
        request = self.context.get('request')
        booking = validated_data.get('booking')

        with transaction.atomic():
            payment = Payment.objects.create(
                user=request.user,
                booking=booking,
                payment_method=validated_data.get('payment_method'),
                amount=booking.total_price,
                expires_at = timezone.now() + timedelta(
                    minutes=getattr(settings, "PAYMENT_EXPIRE_MINUTES", 15)
                ),
                transaction_id = f"PAY{uuid.uuid4().hex}",
                )
            return create_gateway_payment(payment, request)

    def to_representation(self, instance):
        return PaymentReadSerializer(
            instance,
            context=self.context,
        ).data
