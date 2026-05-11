from rest_framework import serializers
from backend.bookings.models import Booking
from .models import Payment
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
        
        return payment