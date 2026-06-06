from rest_framework import serializers
from .models import (
    BaseService,
    Category,
    Package,
    TourPackage,
    TravelTour,
    Hotel,
    Transport,
    RoomType,
    Room,
    SeatType,
    PhysicalSeat,
    Route,
    SeatStatus,
    ServiceImage,
    Wishlist,
    PromoBanner,
    Comment,
)
from accounts.serializers import UserReadSerializer
from locations.serializers import CityReadSerializer
from django.db.models import Count
from django.utils import timezone


# ==================== Category ====================
class CategoryReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active']


class CategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name', 'description', 'is_active']


# ==================== Package ====================
class PackageReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'name']


class PackageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['name']


# ==================== Service Image ====================
class ServiceImageReadSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ServiceImage
        fields = ['id', 'image', 'image_url', 'caption', 'display_order']

    def get_image_url(self, obj):
        request = self.context.get("request")
        url = obj.image.url if obj.image else None
        if request and url:
            return request.build_absolute_uri(url)
        return url


class ServiceImageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ['image', 'caption', 'display_order']


# ==================== Base Service ====================
class BaseServiceReadSerializer(serializers.ModelSerializer):
    category = CategoryReadSerializer()
    city = CityReadSerializer()
    provider = UserReadSerializer()
    images = ServiceImageReadSerializer(many=True, read_only=True)

    class Meta:
        model = BaseService
        fields = [
            'id', 'name', 'description', 'service_type',
            'base_price', 'departure_time', 'available_slots',
            'star_rating', 'review_count', 'address_detail',
            'city', 'provider', 'category', 'images',
            'is_active', 'created_at', 'updated_at',
        ]


class BaseServiceWriteSerializer(serializers.ModelSerializer):
    images = ServiceImageWriteSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = BaseService
        fields = [
            'name', 'description', 'service_type', 'base_price',
            'departure_time', 'available_slots', 'address_detail',
            'city', 'category', 'images',
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        service = BaseService.objects.create(**validated_data)
        for img_data in images_data:
            ServiceImage.objects.create(service=service, **img_data)
        return service

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if images_data is not None:
            instance.images.all().delete()
            for img_data in images_data:
                ServiceImage.objects.create(service=instance, **img_data)
        return instance


# ==================== Tour Package ====================
class TourPackageReadSerializer(serializers.ModelSerializer):
    packages = PackageReadSerializer(many=True, read_only=True)
    tour_name = serializers.CharField(source='tour.name', read_only=True)

    class Meta:
        model = TourPackage
        fields = ['id', 'tour', 'tour_name', 'name', 'description', 'price', 'packages']


class TourPackageWriteSerializer(serializers.ModelSerializer):
    packages = serializers.PrimaryKeyRelatedField(
        queryset=Package.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = TourPackage
        fields = ['tour', 'name', 'description', 'price', 'packages']

    def create(self, validated_data):
        packages = validated_data.pop('packages', [])
        tour_package = TourPackage.objects.create(**validated_data)
        if packages:
            tour_package.packages.set(packages)
        return tour_package

    def update(self, instance, validated_data):
        packages = validated_data.pop('packages', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if packages is not None:
            instance.packages.set(packages)
        return instance


# ==================== Travel Tour ====================
class TravelTourReadSerializer(BaseServiceReadSerializer):
    tour_packages = TourPackageReadSerializer(many=True, read_only=True, source='tour_packages')
    comment_count = serializers.SerializerMethodField()

    class Meta(BaseServiceReadSerializer.Meta):
        fields = BaseServiceReadSerializer.Meta.fields + [
            'time_start', 'empty_slot', 'tour_packages', 'comment_count',
        ]

    def get_comment_count(self, obj):
        return obj.comments.count()


class TravelTourWriteSerializer(BaseServiceWriteSerializer):
    class Meta(BaseServiceWriteSerializer.Meta):
        fields = BaseServiceWriteSerializer.Meta.fields + ['time_start', 'empty_slot']


# ==================== Room ====================
class RoomReadSerializer(serializers.ModelSerializer):
    room_type_name = serializers.CharField(source='room_type.name', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'room_number', 'is_available', 'total_beds', 'room_type_name', 'hotel_name']


class RoomWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['hotel', 'room_type', 'room_number', 'is_available', 'total_beds']


# ==================== Room Type ====================
class RoomTypeReadSerializer(serializers.ModelSerializer):
    available_count = serializers.SerializerMethodField()

    class Meta:
        model = RoomType
        fields = ['id', 'name', 'price', 'total_beds', 'available_count']

    def get_available_count(self, obj):
        return obj.rooms.filter(is_available=True).count()


class RoomTypeWriteSerializer(serializers.ModelSerializer):
    rooms = RoomWriteSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = RoomType
        fields = ['hotel', 'name', 'price', 'total_beds', 'rooms']

    def create(self, validated_data):
        rooms_data = validated_data.pop('rooms', [])
        room_type = RoomType.objects.create(**validated_data)
        for room_data in rooms_data:
            Room.objects.create(room_type=room_type, **room_data)
        return room_type

    def update(self, instance, validated_data):
        rooms_data = validated_data.pop('rooms', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if rooms_data is not None:
            instance.rooms.all().delete()
            for room_data in rooms_data:
                Room.objects.create(room_type=instance, **room_data)
        return instance


# ==================== Hotel ====================
class HotelReadSerializer(BaseServiceReadSerializer):
    room_types = RoomTypeReadSerializer(many=True, read_only=True, source='room_types')
    total_rooms = serializers.SerializerMethodField()

    class Meta(BaseServiceReadSerializer.Meta):
        fields = BaseServiceReadSerializer.Meta.fields + ['room_types', 'total_rooms']

    def get_total_rooms(self, obj):
        return obj.rooms.count()


class HotelWriteSerializer(BaseServiceWriteSerializer):
    room_types = RoomTypeWriteSerializer(many=True, write_only=True, required=False)

    class Meta(BaseServiceWriteSerializer.Meta):
        fields = BaseServiceWriteSerializer.Meta.fields + ['room_types']

    def create(self, validated_data):
        room_types_data = validated_data.pop('room_types', [])
        service = super().create(validated_data)
        for rt_data in room_types_data:
            RoomTypeWriteSerializer().create(rt_data)
        return service


# ==================== Seat Type ====================
class SeatTypeReadSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.username', read_only=True)

    class Meta:
        model = SeatType
        fields = ['id', 'name', 'price', 'provider_name']


class SeatTypeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatType
        fields = ['name', 'price']


# ==================== Physical Seat ====================
class PhysicalSeatReadSerializer(serializers.ModelSerializer):
    seat_type_name = serializers.CharField(source='seat_type.name', read_only=True)
    transport_name = serializers.CharField(source='transport.name', read_only=True)

    class Meta:
        model = PhysicalSeat
        fields = ['id', 'seat_number', 'seat_type_name', 'transport_name']


class PhysicalSeatWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalSeat
        fields = ['transport', 'seat_type', 'seat_number']


# ==================== Route ====================
class RouteReadSerializer(serializers.ModelSerializer):
    from_city = CityReadSerializer()
    to_city = CityReadSerializer()

    class Meta:
        model = Route
        fields = ['id', 'transport', 'from_city', 'to_city', 'departure_time', 'arrival_time']


class RouteWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['transport', 'from_city', 'to_city', 'departure_time', 'arrival_time']


# ==================== Seat Status ====================
class SeatStatusReadSerializer(serializers.ModelSerializer):
    seat_number = serializers.CharField(source='physical_seat.seat_number', read_only=True)
    seat_type_name = serializers.CharField(source='physical_seat.seat_type.name', read_only=True)

    class Meta:
        model = SeatStatus
        fields = ['id', 'route', 'seat_number', 'seat_type_name', 'status', 'booking']


# ==================== Transport ====================
class TransportReadSerializer(BaseServiceReadSerializer):
    routes = RouteReadSerializer(many=True, read_only=True)
    seat_types = SeatTypeReadSerializer(many=True, read_only=True)

    class Meta(BaseServiceReadSerializer.Meta):
        fields = BaseServiceReadSerializer.Meta.fields + [
            'brand_name', 'license_plate', 'routes', 'seat_types',
        ]


class TransportWriteSerializer(BaseServiceWriteSerializer):
    class Meta(BaseServiceWriteSerializer.Meta):
        fields = BaseServiceWriteSerializer.Meta.fields + ['brand_name', 'license_plate']


# ==================== Comment ====================
class CommentReadSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user_id', 'username', 'travel_tour', 'content', 'rating', 'created_at']


class CommentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['travel_tour', 'content', 'rating']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ==================== Wishlist ====================
class WishlistReadSerializer(serializers.ModelSerializer):
    service = BaseServiceReadSerializer(read_only=True)
    service_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Wishlist
        fields = ['id', 'service', 'service_id', 'created_at']


class WishlistWriteSerializer(serializers.ModelSerializer):
    service_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ['service_id']

    def validate_service_id(self, value):
        if not BaseService.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Service does not exist.')
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['service_id'] = validated_data.pop('service_id')
        return super().create(validated_data)


# ==================== Promo Banner ====================
class PromoBannerReadSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PromoBanner
        fields = [
            'id', 'title', 'subtitle', 'image', 'image_url',
            'cta_text', 'background_color', 'is_active',
            'display_order', 'created_at', 'updated_at',
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        url = obj.image.url if obj.image else None
        if request and url:
            return request.build_absolute_uri(url)
        return url


class PromoBannerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoBanner
        fields = [
            'title', 'subtitle', 'image', 'cta_text',
            'background_color', 'is_active', 'display_order',
        ]