from rest_framework import serializers
from bookings.models import Booking
from .models import Payment
from .payServices.payment_service import create_gateway_checkout
import uuid

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
            "paid_at",
            "refund_amount",
            "metadata",
            "created_at",
            "updated_at"
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
        
        existing_pending_payment = Payment.objects.filter(
            booking=booking, 
            payment_status__in=[
                Payment.PaymentStatus.PENDING, 
                Payment.PaymentStatus.PROCESSING
                ]
            ).exists()
        
        if existing_pending_payment:
            raise serializers.ValidationError("Đã có một thanh toán đang chờ xử lý cho booking này.")

        return booking
    
    def create(self, validated_data):
        request = self.context.get('request')
        booking = validated_data.get('booking')

        payment = Payment.objects.create(
            user=request.user,
            booking=booking,
            payment_method=validated_data.get('payment_method'),
            amount=booking.total_price,
            transaction_id = f"PAY-{uuid.uuid4().hex}")
        
        return create_gateway_checkout(payment, request)
