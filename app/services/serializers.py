from rest_framework import serializers

from .models import (
    BaseService,
    Category,
    City,
    Hotel,
    PhysicalSeat,
    RoomType,
    SeatType,
    TourPackage,
    Transport,
    TravelTour,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class CitySerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)

    class Meta:
        model = City
        fields = ['id', 'name', 'country_name']


class BaseServiceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseService
        fields = ['name', 'description', 'is_active', 'city', 'provider', 'category']

    def validate(self, attrs):
        provider = attrs.get('provider') or getattr(self.instance, 'provider', None)
        if provider and not provider.is_provider:
            raise serializers.ValidationError({'provider': 'Provider phải là tài khoản nhà cung cấp.'})
        return attrs


class BaseServiceListSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    provider_username = serializers.CharField(source='provider.username', read_only=True)

    class Meta:
        model = BaseService
        fields = ['id', 'name', 'is_active', 'city_name', 'category_name', 'provider_username']


class BaseServiceDetailSerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    provider_username = serializers.CharField(source='provider.username', read_only=True)

    class Meta:
        model = BaseService
        fields = [
            'id',
            'name',
            'description',
            'is_active',
            'created_at',
            'updated_at',
            'city',
            'category',
            'provider',
            'provider_username',
        ]


class TravelTourCreateSerializer(BaseServiceWriteSerializer):
    class Meta(BaseServiceWriteSerializer.Meta):
        model = TravelTour
        fields = BaseServiceWriteSerializer.Meta.fields + ['time_start', 'empty_slot', 'base_price']


class TravelTourUpdateSerializer(TravelTourCreateSerializer):
    pass


class TravelTourListSerializer(BaseServiceListSerializer):
    class Meta(BaseServiceListSerializer.Meta):
        model = TravelTour
        fields = BaseServiceListSerializer.Meta.fields + ['time_start', 'empty_slot', 'base_price']


class TravelTourDetailSerializer(BaseServiceDetailSerializer):
    class Meta(BaseServiceDetailSerializer.Meta):
        model = TravelTour
        fields = BaseServiceDetailSerializer.Meta.fields + ['time_start', 'empty_slot', 'base_price']


class HotelCreateSerializer(BaseServiceWriteSerializer):
    class Meta(BaseServiceWriteSerializer.Meta):
        model = Hotel
        fields = BaseServiceWriteSerializer.Meta.fields + ['star_rating', 'address_detail']


class HotelUpdateSerializer(HotelCreateSerializer):
    pass


class HotelListSerializer(BaseServiceListSerializer):
    class Meta(BaseServiceListSerializer.Meta):
        model = Hotel
        fields = BaseServiceListSerializer.Meta.fields + ['star_rating', 'address_detail']


class HotelDetailSerializer(BaseServiceDetailSerializer):
    room_type_count = serializers.IntegerField(source='room_types.count', read_only=True)

    class Meta(BaseServiceDetailSerializer.Meta):
        model = Hotel
        fields = BaseServiceDetailSerializer.Meta.fields + ['star_rating', 'address_detail', 'room_type_count']


class RoomTypeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['hotel', 'name', 'price', 'capacity', 'total_rooms', 'available_rooms', 'description']


class RoomTypeListSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = RoomType
        fields = ['id', 'hotel', 'hotel_name', 'name', 'price', 'capacity', 'total_rooms', 'available_rooms']


class SeatTypeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatType
        fields = ['name', 'price']


class SeatTypeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatType
        fields = ['id', 'name', 'price']


class TransportCreateSerializer(BaseServiceWriteSerializer):
    class Meta(BaseServiceWriteSerializer.Meta):
        model = Transport
        fields = BaseServiceWriteSerializer.Meta.fields + ['brand_name', 'license_plate', 'vehicle_type']


class TransportUpdateSerializer(TransportCreateSerializer):
    pass


class TransportListSerializer(BaseServiceListSerializer):
    total_seats = serializers.IntegerField(read_only=True)

    class Meta(BaseServiceListSerializer.Meta):
        model = Transport
        fields = BaseServiceListSerializer.Meta.fields + ['brand_name', 'vehicle_type', 'total_seats']


class PhysicalSeatSerializer(serializers.ModelSerializer):
    seat_type_name = serializers.CharField(source='seat_type.name', read_only=True)

    class Meta:
        model = PhysicalSeat
        fields = ['id', 'seat_number', 'seat_type', 'seat_type_name']


class TransportDetailSerializer(BaseServiceDetailSerializer):
    total_seats = serializers.IntegerField(read_only=True)
    physical_seats = PhysicalSeatSerializer(many=True, read_only=True)

    class Meta(BaseServiceDetailSerializer.Meta):
        model = Transport
        fields = BaseServiceDetailSerializer.Meta.fields + [
            'brand_name',
            'license_plate',
            'vehicle_type',
            'total_seats',
            'physical_seats',
        ]


class TourPackageCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourPackage
        fields = ['tour', 'name', 'price', 'included_services']


class TourPackageDetailSerializer(serializers.ModelSerializer):
    tour_name = serializers.CharField(source='tour.name', read_only=True)
    included_services = BaseServiceListSerializer(many=True, read_only=True)

    class Meta:
        model = TourPackage
        fields = ['id', 'tour', 'tour_name', 'name', 'price', 'included_services']