from rest_framework import serializers
from .models import (
    BaseService,
    Category,
    Package,
    TourPackage,
    TravelTour,
    Comment,
    Hotel,
    Room,
    RoomType,
    Route,
    Transport,
    PhysicalSeat,
    SeatType,
) 

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class BaseServiceSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseService
        fields = ['id', 'name', 'city', 'base_price', 'star_rating']

# TravelTour
class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'name', 'price']

class TourPackageSerializer(serializers.ModelSerializer):
    packages = PackageSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source="total_price",
    )
    class Meta:
        model = TourPackage
        fields = ['id', 'name', 'total_price', 'packages']

class TravelTourSimpleSerializer(BaseServiceSimpleSerializer):
    class Meta:
        model = TravelTour
        fields = BaseServiceSimpleSerializer.Meta.fields

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'content']

class TravelTourDetailSerializer(TravelTourSimpleSerializer):
    tour_packages = TourPackageSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    get_total_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source="get_total_price",
    )
    class Meta:
        model = TravelTour
        fields = TravelTourSimpleSerializer.Meta.fields + ['description','tour_packages','get_total_price','comments']

# Hotel
class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['id', 'name', 'price']

class RoomSerializer(serializers.ModelSerializer):
    room_type = RoomTypeSerializer(read_only=True)
    class Meta:
        model = Room
        fields = ['id', 'room_type', 'room_number', 'is_available', 'total_beds']

class HotelSimpleSerializer(BaseServiceSimpleSerializer):
    class Meta:
        model = Hotel
        fields = BaseServiceSimpleSerializer.Meta.fields

class HotelDetailSerializer(HotelSimpleSerializer):
    total_rooms = serializers.IntegerField(read_only=True, source='total_rooms')
    class Meta:
        model = Hotel
        fields = HotelSimpleSerializer.Meta.fields + ['total_rooms','address_detail']

# Transport
class SeatTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatType
        fields = ['id', 'provider', 'name', 'price']
        read_only_fields = ['provider']


class PhysicalSeatSerializer(serializers.ModelSerializer):
    seat_type = serializers.CharField(read_only=True, source='seat_type.name')
    class Meta:
        model = PhysicalSeat
        fields = ['id', 'seat_type', 'seat_number']

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['id', 'from_city', 'to_city', 'departure_time', 'arrival_time']

class TransportSimpleSerializer(BaseServiceSimpleSerializer):
    class Meta:
        model = Transport
        fields = BaseServiceSimpleSerializer.Meta.fields

class TransportDetailSerializer(TransportSimpleSerializer):
    routes = RouteSerializer(many=True, read_only=True)
    class Meta:
        model = Transport
        fields = TransportSimpleSerializer.Meta.fields + ['brand_name', 'license_plate', 'vehicle_type', 'total_seats', 'routes']