from rest_framework import serializers
from accounts.serializers import UserReadSerializer
from locations.serializers import CityReadSerializer
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
    SeatType,
) 

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name']

class BaseServiceReadSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    city = CityReadSerializer()
    provider = UserReadSerializer()
    class Meta:
        model = BaseService
        fields = ['id','name','description','star_rating','base_price','city','provider','category']

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id','name']

class TourPackageSimpleReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourPackage
        fields = ['id','name','price']

class TourPackageDetailReadSerializer(TourPackageSimpleReadSerializer):
    packages = PackageSerializer(many=True)
    class Meta:
        model = TourPackage
        fields = TourPackageSimpleReadSerializer.Meta.fields + ['tour','packages','price']

class TravelTourSimpleReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelTour
        fields = ['id','name','city','category']

class TravelTourReadDetailSerializer(TravelTourSimpleReadSerializer):
    tour_package = TourPackageSimpleReadSerializer(many=True)
    class Meta:
        model = TravelTour
        fields = TravelTourSimpleReadSerializer.Meta.fields + ['description','star_rating','base_price','empty_slot','tour_package']

class TravelTourWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelTour
        fields = ['name','description','base_price','time_start']



class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    class Meta:
        model = Comment
        fields = ['id','username','content']

class HotelSimpleReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['id','name','city']

class HotelDetailReadSerializer(HotelSimpleReadSerializer):
    class Meta:
        model = Hotel
        fields = HotelSimpleReadSerializer.Meta.fields + ['description','star_rating','base_price','address_detail','total_rooms']

class HotelWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['name','description','address_detail']

class RoomTypeSimpleReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['id','name']

class RoomSimpleReadSerializer(serializers.ModelSerializer):
    room_type = RoomTypeSimpleReadSerializer()
    class Meta:
        model = Room
        fields = ['id','room_type','room_number','is_available','total_beds']

class RoomWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['room_type','room_number','is_available','total_beds']

