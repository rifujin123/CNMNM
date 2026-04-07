from bookings.models import booking
from rest_framework import serializers

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = booking
        fields = "__all__"
        read_only_fields = ('user','booking_status','created_date')


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = booking
        fields = ['service','room_type','seat_type','quantity']
