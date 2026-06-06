from rest_framework import serializers
from .models import ProviderRevenue, ChatRoom, Message
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
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'provider', 'customer', 'booking', 'last_message', 'last_message_at', 'created_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {'message': last_msg.message, 'created_at': last_msg.created_at}
        return None


class MessageReadSerializer(serializers.ModelSerializer):
    sender = UserReadSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'message', 'is_read', 'created_at']


class MessageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['room', 'message']