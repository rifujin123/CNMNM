from rest_framework import serializers
from accounts.serializers import UserReadSerializer
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
    Continent,
    Country,
    City,
) 




class CategoryReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name']

class CategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']

class BaseServiceReadSerializer(serializers.ModelSerializer):
    category = CategoryReadSerializer()
    city = CityReadSerializer()
    provider = UserReadSerializer()
    class Meta:
        model = BaseService
        fields = ['id','name','description','star_rating','base_price','city','provider','category']

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['name']

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
        fields = TravelTourSimpleReadSerializer.Meta.fields + ['description','star_rating','base_price','time_start','empty_slot','tour_package']

class TravelTourWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelTour
        fields = ['name','description','base_price','time_start']



class CommentSerializer(serializers.ModelSerializer):
    user = UserReadSerializer()
    class Meta:
        model = Comment
        fields = ['user','content']

class CommentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']

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

