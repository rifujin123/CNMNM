from rest_framework import serializers
from .models import ProviderRevenue, ChatRoom
from accounts.serializers import UserReadSerializer


class ProviderRevenueReadSerializer(serializers.ModelSerializer):
    period_display = serializers.CharField(source='get_period_display', read_only=True)

    class Meta:
        model = ProviderRevenue
        fields = [
            'id', 'provider', 'period', 'period_display',
            'period_value', 'total_bookings', 'total_revenue',
            'service_breakdown', 'calculated_at',
        ]


class ChatRoomReadSerializer(serializers.ModelSerializer):
    provider = UserReadSerializer(read_only=True)
    customer = UserReadSerializer(read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'firebase_key', 'provider', 'customer', 'booking', 'created_at']