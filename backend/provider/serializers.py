from rest_framework import serializers

from accounts.serializers import UserReadSerializer


class BookingSerializer(serializers.Serializer):
    customer = UserReadSerializer(source="user", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)
    service_type = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    payment_status = serializers.CharField(read_only=True)

    def get_service_type(self, obj):
        service = getattr(obj, "service", None)
        if hasattr(service, "traveltour"):
            return "tour"
        if hasattr(service, "hotel"):
            return "hotel"
        if hasattr(service, "transport"):
            return "transport"
        return "service"

    def get_category(self, obj):
        service = getattr(obj, "service", None)
        category = getattr(service, "category", None)
        if category:
            return {
                "id": category.id,
                "name": category.name,
            }
        return None

    class Meta:
        fields = [
            "id",
            "customer",
            "service_name",
            "service_type",
            "category",
            "quantity",
            "total_price",
            "booking_status",
            "payment_status",
            "created_date",
        ]


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
        service_type = "service"
        if hasattr(service, "traveltour"):
            service_type = "tour"
        elif hasattr(service, "hotel"):
            service_type = "hotel"
        elif hasattr(service, "transport"):
            service_type = "transport"
        return {
            "id": service.id,
            "name": service.name,
            "type": service_type,
        }
