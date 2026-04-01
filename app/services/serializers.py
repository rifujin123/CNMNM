
from rest_framework import serializers

from services.models import TravelTour, Hotel, Transport,BaseService,TourPackage,SeatType

class BaseServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseService
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at', 'city', 'provider', 'category']

class TravelTourSerializer(BaseServiceSerializer):
    class Meta(BaseServiceSerializer.Meta):
        model = TravelTour
        fields = BaseServiceSerializer.Meta.fields + ['time_start', 'empty_slot', 'base_price']

class TourPackageSerializer(serializers.ModelSerializer):
    included_services = BaseServiceSerializer(many=True, read_only=True)
    class Meta:
        model = TourPackage
        fields = ['id', 'name', 'description', 'price', 'included_services']

class HotelSerializer(BaseServiceSerializer):
    class Meta(BaseServiceSerializer.Meta):
        model = Hotel
        fields = BaseServiceSerializer.Meta.fields + ['star_rating', 'address_detail']

class SeatTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatType
        fields = ['id','name','price']

class TransportSerializer(BaseServiceSerializer):
    seat_types = SeatTypeSerializer(many=True, read_only=True)
    class Meta(BaseServiceSerializer.Meta):
        model = Transport
        fields = BaseServiceSerializer.Meta.fields + ['brand_name', 'seat_types']