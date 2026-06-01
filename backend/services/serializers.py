import json
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
    SeatStatus,
    PromoBanner,
    ServiceImage,
    Wishlist,
)
from django.db.models import Count
from django.utils import timezone


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name']

class ServiceImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        request = self.context.get("request")
        url = obj.image.url if obj.image else None
        if request and url:
            return request.build_absolute_uri(url)
        return url

    class Meta:
        model = ServiceImage
        fields = ["id", "image", "image_url", "caption"]


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
    total_price = serializers.SerializerMethodField()

    def get_total_price(self, obj):
        return obj.price + obj.tour.base_price

    class Meta:
        model = TourPackage
        fields = ['id', 'name', 'price', 'total_price']

class TourPackageDetailReadSerializer(TourPackageSimpleReadSerializer):
    packages = PackageSerializer(many=True)

    class Meta:
        model = TourPackage
        fields = TourPackageSimpleReadSerializer.Meta.fields + ['tour', 'packages']

class TourPackageWriteSerializer(serializers.ModelSerializer):
    packages = serializers.PrimaryKeyRelatedField(
        queryset=Package.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = TourPackage
        fields = ['tour', 'name', 'price', 'packages']

class TravelTourSimpleReadSerializer(serializers.ModelSerializer):
    city = CityReadSerializer()
    category = CategorySerializer()

    class Meta:
        model = TravelTour
        fields = ['id', 'name', 'city', 'category']

class TravelTourReadDetailSerializer(TravelTourSimpleReadSerializer):
    tour_package = TourPackageSimpleReadSerializer(many=True)
    images = ServiceImageSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()

    def get_comment_count(self, obj):
        return obj.comments.count()

    class Meta:
        model = TravelTour
        fields = TravelTourSimpleReadSerializer.Meta.fields + [
            'description',
            'star_rating',
            'base_price',
            'empty_slot',
            'tour_package',
            'images',
            'comment_count',
            'time_start',
            'is_active',
            'created_at',
            'updated_at',
        ]

class TourPackageNestedWriteSerializer(serializers.ModelSerializer):
    packages = serializers.PrimaryKeyRelatedField(
        queryset=Package.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = TourPackage
        fields = ['name', 'price', 'packages']


class TravelTourWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, write_only=True)
    tour_packages = TourPackageNestedWriteSerializer(many=True, required=False, write_only=True)

    def to_internal_value(self, data):
        data = data.copy()
        tour_packages = data.get('tour_packages')
        if isinstance(tour_packages, str):
            data['tour_packages'] = json.loads(tour_packages)
        return super().to_internal_value(data)

    class Meta:
        model = TravelTour
        fields = [
            'name', 'description', 'base_price',
            'time_start', 'empty_slot', 'city',
            'image', 'tour_packages',
        ]

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        packages_data = validated_data.pop('tour_packages', [])
        tour = TravelTour.objects.create(**validated_data)
        if image:
            ServiceImage.objects.create(service=tour, image=image)
        for pkg_data in packages_data:
            sub_packages = pkg_data.pop('packages', [])
            tp = TourPackage.objects.create(tour=tour, **pkg_data)
            if sub_packages:
                tp.packages.set(sub_packages)
        return tour

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        packages_data = validated_data.pop('tour_packages', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if image:
            instance.images.all().delete()
            ServiceImage.objects.create(service=instance, image=image)

        if packages_data is not None:
            instance.tour_package.all().delete()
            for pkg_data in packages_data:
                sub_packages = pkg_data.pop('packages', [])
                tp = TourPackage.objects.create(tour=instance, **pkg_data)
                if sub_packages:
                    tp.packages.set(sub_packages)

        return instance



class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    class Meta:
        model = Comment
        fields = ['id','user_id','username','content','rating']

class WishlistSerializer(serializers.ModelSerializer):
    service_id = serializers.IntegerField(write_only=True, required=False)
    tour_id = serializers.IntegerField(write_only=True, required=False)
    service = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'service_id', 'tour_id', 'service', 'created_at']

    def validate(self, attrs):
        sid = attrs.pop('service_id', None) or attrs.pop('tour_id', None)
        if not sid:
            raise serializers.ValidationError({'service_id': 'ID is required.'})

        service = BaseService.objects.filter(pk=sid).first()
        if not service:
            raise serializers.ValidationError({'service_id': 'Does not exist.'})

        attrs['service'] = service
        return attrs

    def get_service_type(self, service):
        if hasattr(service, 'traveltour'):
            return 'tour'
        if hasattr(service, 'hotel'):
            return 'hotel'
        if hasattr(service, 'transport'):
            return 'transport'
        return 'service'

    def get_service(self, obj):
        service = obj.service
        return {
            'id': service.id,
            'name': service.name,
            'description': service.description,
            'star_rating': service.star_rating,
            'base_price': service.base_price,
            'city': CityReadSerializer(service.city).data if service.city else None,
            'category': CategorySerializer(service.category).data if service.category else None,
            'type': self.get_service_type(service),
        }

class RoomTypeReadSerializer(serializers.ModelSerializer):
    available_rooms = serializers.SerializerMethodField()

    class Meta:
        model = RoomType
        fields = ['id', 'name', 'price', 'available_rooms']
    
    def get_available_rooms(self, obj):
        return obj.rooms.filter(is_available=True).count()

class RoomReadSerializer(serializers.ModelSerializer):
    room_type = RoomTypeReadSerializer()
    class Meta:
        model = Room
        fields = ['id','room_type','room_number','is_available','total_beds']

class RoomWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['hotel','room_type','room_number','is_available','total_beds']


class RoomNestedWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['room_number', 'is_available', 'total_beds']


class RoomTypeNestedWriteSerializer(serializers.ModelSerializer):
    rooms = RoomNestedWriteSerializer(many=True, required=False)

    class Meta:
        model = RoomType
        fields = ['name', 'price', 'rooms']


class HotelSimpleReadSerializer(serializers.ModelSerializer):
    city = CityReadSerializer()
    category = CategorySerializer()

    class Meta:
        model = Hotel
        fields = ['id','name','city','category']



class HotelDetailReadSerializer(HotelSimpleReadSerializer):
    images = ServiceImageSerializer(many=True, read_only=True)
    room_types = RoomTypeReadSerializer(many=True, read_only=True)
    rooms = serializers.SerializerMethodField()

    def get_rooms(self, obj):
        rooms = obj.rooms.filter(is_available=True).select_related('room_type')
        return RoomReadSerializer(rooms, many=True).data

    class Meta:
        model = Hotel
        fields = HotelSimpleReadSerializer.Meta.fields + [
            'description',
            'star_rating',
            'base_price',
            'address_detail',
            'total_rooms',
            'room_types',
            'rooms',
            'images'
        ]


class HotelWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, write_only=True)
    room_types = RoomTypeNestedWriteSerializer(many=True, required=False, write_only=True)

    def to_internal_value(self, data):
        data = data.copy()
        room_types = data.get('room_types')
        if isinstance(room_types, str):
            data['room_types'] = json.loads(room_types)
        return super().to_internal_value(data)

    class Meta:
        model = Hotel
        fields = [
            'name', 'description', 'base_price',
            'address_detail', 'city', 'image', 'room_types',
        ]

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        room_types_data = validated_data.pop('room_types', [])
        hotel = Hotel.objects.create(**validated_data)
        if image:
            ServiceImage.objects.create(service=hotel, image=image)
        for room_type_data in room_types_data:
            rooms_data = room_type_data.pop('rooms', [])
            room_type = RoomType.objects.create(hotel=hotel, **room_type_data)
            for room_data in rooms_data:
                Room.objects.create(hotel=hotel, room_type=room_type, **room_data)
        return hotel

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        room_types_data = validated_data.pop('room_types', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if image:
            instance.images.all().delete()
            ServiceImage.objects.create(service=instance, image=image)
        if room_types_data is not None:
            instance.room_types.all().delete()
            for room_type_data in room_types_data:
                rooms_data = room_type_data.pop('rooms', [])
                room_type = RoomType.objects.create(hotel=instance, **room_type_data)
                for room_data in rooms_data:
                    Room.objects.create(hotel=instance, room_type=room_type, **room_data)
        return instance


class SeatTypeReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatType
        fields = ['id', 'name', 'price']


class TransportSimpleReadSerializer(serializers.ModelSerializer):
    city = CityReadSerializer()
    category = CategorySerializer()

    class Meta:
        model = Transport
        fields = ['id', 'name', 'city', 'category']

class RouteReadSerializer(serializers.ModelSerializer):
    from_city = CityReadSerializer()
    to_city = CityReadSerializer()

    class Meta:
        model = Route
        fields = ['id', 'from_city', 'to_city', 'departure_time', 'arrival_time']


class TransportDetailReadSerializer(TransportSimpleReadSerializer):
    images = ServiceImageSerializer(many=True, read_only=True)
    routes = serializers.SerializerMethodField()
    seat_types = serializers.SerializerMethodField()
    availability = serializers.SerializerMethodField()

    def get_routes(self, obj):
        routes = obj.routes.filter(
            departure_time__gte=timezone.now()
        ).order_by('departure_time')
        return RouteReadSerializer(routes, many=True).data

    def get_seat_types(self, obj):
        seat_types = SeatType.objects.filter(
            physical_seats__transport=obj
        ).distinct()
        return SeatTypeReadSerializer(seat_types, many=True).data

    def get_availability(self, obj):
        seat_types = list(
            SeatType.objects.filter(physical_seats__transport=obj).distinct()
        )

        route_ids = list(
            obj.routes.filter(
                departure_time__gte=timezone.now()
            ).values_list('id', flat=True)
        )

        rows = (
            SeatStatus.objects
            .filter(
                route__transport=obj,
                status=SeatStatus.Status.AVAILABLE,
                booking__isnull=True,
                route__departure_time__gte=timezone.now(),
            )
            .values('route_id', 'physical_seat__seat_type_id')
            .annotate(available_seats=Count('id'))
        )

        count_map = {
            (row['route_id'], row['physical_seat__seat_type_id']): row['available_seats']
            for row in rows
        }

        return [
            {
                'route': route_id,
                'seat_type': seat_type.id,
                'available_seats': count_map.get((route_id, seat_type.id), 0),
            }
            for route_id in route_ids
            for seat_type in seat_types
        ]

    class Meta:
        model = Transport
        fields = TransportSimpleReadSerializer.Meta.fields + [
            'description',
            'star_rating',
            'base_price',
            'brand_name',
            'license_plate',
            'images',
            'total_seats',
            'routes',
            'seat_types',
            'availability',
        ]


class RouteNestedWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['from_city', 'to_city', 'departure_time', 'arrival_time']


class TransportWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, write_only=True)
    routes = RouteNestedWriteSerializer(many=True, required=False, write_only=True)

    def to_internal_value(self, data):
        data = data.copy()
        routes = data.get('routes')
        if isinstance(routes, str):
            data['routes'] = json.loads(routes)
        return super().to_internal_value(data)

    class Meta:
        model = Transport
        fields = [
            'name',
            'description',
            'base_price',
            'city',
            'brand_name',
            'license_plate',
            'image',
            'routes',
        ]

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        routes_data = validated_data.pop('routes', [])
        transport = Transport.objects.create(**validated_data)
        if image:
            ServiceImage.objects.create(service=transport, image=image)
        for route_data in routes_data:
            Route.objects.create(transport=transport, **route_data)
        return transport

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        routes_data = validated_data.pop('routes', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if image:
            instance.images.all().delete()
            ServiceImage.objects.create(service=instance, image=image)

        if routes_data is not None:
            instance.routes.all().delete()
            for route_data in routes_data:
                Route.objects.create(transport=instance, **route_data)

        return instance


class PromoBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoBanner
        fields = [
            'id',
            'title',
            'subtitle',
            'image',
            'cta_text',
            'background_color',
            'is_active',
            'display_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']



