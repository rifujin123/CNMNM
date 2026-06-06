from rest_framework import serializers
from .models import Booking, BookingItem, BookingReview
from accounts.serializers import UserReadSerializer


class BookingItemReadSerializer(serializers.ModelSerializer):
    item_type_display = serializers.CharField(source='get_item_type_display', read_only=True)

    class Meta:
        model = BookingItem
        fields = ['id', 'item_type', 'item_type_display', 'item_id', 'quantity', 'price']


class BookingItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingItem
        fields = ['booking', 'item_type', 'item_id', 'quantity', 'price']


class BookingReviewReadSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = BookingReview
        fields = ['id', 'booking', 'user', 'username', 'rating', 'content', 'created_at']


class BookingReviewWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingReview
        fields = ['booking', 'rating', 'content']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BookingReadSerializer(serializers.ModelSerializer):
    user = UserReadSerializer(read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_type = serializers.SerializerMethodField()
    items = BookingItemReadSerializer(many=True, read_only=True)
    review = BookingReviewReadSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'service', 'service_name', 'service_type',
            'quantity', 'unit_price', 'total_price',
            'booking_status', 'payment_status',
            'cancellation_reason', 'cancelled_at',
            'expires_at', 'notes', 'items', 'review',
            'created_at', 'updated_at',
        ]

    def get_service_type(self, obj):
        return obj.service.service_type if obj.service else None


class BookingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'service', 'quantity', 'unit_price', 'total_price',
            'notes',
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ==================== Stats Serializers ====================
class RevenueByTypeSerializer(serializers.Serializer):
    type = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    bookings = serializers.IntegerField()
    percent = serializers.FloatField(required=False)


class TopServiceSerializer(serializers.Serializer):
    id = serializers.IntegerField(source="service__id")
    name = serializers.CharField(source="service__name")
    bookings = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class RevenueSummarySerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_bookings = serializers.IntegerField()
    avg_per_booking = serializers.DecimalField(max_digits=12, decimal_places=2)
    from_date = serializers.DateTimeField()
    to_date = serializers.DateTimeField()


class RevenueStatsSerializer(serializers.Serializer):
    summary = RevenueSummarySerializer()
    by_service_type = RevenueByTypeSerializer(many=True)
    top_services = TopServiceSerializer(many=True)
    revenue_series = serializers.ListField()


class ServiceStatsSerializer(serializers.Serializer):
    service = serializers.SerializerMethodField()
    total_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2)

    def get_service(self, obj):
        service = obj["service"]
        return {
            "id": service.id,
            "name": service.name,
            "type": service.service_type,
        }