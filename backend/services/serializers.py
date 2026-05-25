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
    Wishlist,
    ServiceImage
)
from django.db.models import Count
from django.utils import timezone


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
    price_display = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    total_price_display = serializers.SerializerMethodField()

    def get_price_display(self, obj):
        return f"{obj.price:,.0f}"

    def get_total_price(self, obj):
        return obj.price + obj.tour.base_price

    def get_total_price_display(self, obj):
        return f"{obj.price + obj.tour.base_price:,.0f}"

    class Meta:
        model = TourPackage
        fields = ['id', 'name', 'price', 'price_display', 'total_price', 'total_price_display']

class TourPackageDetailReadSerializer(TourPackageSimpleReadSerializer):
    packages = PackageSerializer(many=True)
    class Meta:
        model = TourPackage
        fields = TourPackageSimpleReadSerializer.Meta.fields + ['tour','packages','price']


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
    base_price_display = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    def get_base_price_display(self, obj):
        return f"{obj.base_price:,.0f}"

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
            'base_price_display',
            'comment_count',
            'time_start',
            'is_active',
            'created_at',
            'updated_at',
        ]

class TourPackageNestedWriteSerializer(serializers.ModelSerializer):
    """Nested inside TravelTour write — no 'tour' field needed."""
    packages = serializers.PrimaryKeyRelatedField(
        queryset=Package.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = TourPackage
        fields = ['name', 'price', 'packages']


class TravelTourWriteSerializer(serializers.ModelSerializer):
    tour_packages = TourPackageNestedWriteSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = TravelTour
        fields = [
            'name', 'description', 'base_price',
            'time_start', 'empty_slot', 'city',
            'tour_packages',
        ]

    def create(self, validated_data):
        packages_data = validated_data.pop('tour_packages', [])
        tour = TravelTour.objects.create(**validated_data)
        for pkg_data in packages_data:
            sub_packages = pkg_data.pop('packages', [])
            tp = TourPackage.objects.create(tour=tour, **pkg_data)
            if sub_packages:
                tp.packages.set(sub_packages)
        return tour

    def update(self, instance, validated_data):
        packages_data = validated_data.pop('tour_packages', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if packages_data is not None:
            # Replace all tour packages
            instance.tour_package.all().delete()
            for pkg_data in packages_data:
                sub_packages = pkg_data.pop('packages', [])
                tp = TourPackage.objects.create(tour=instance, **pkg_data)
                if sub_packages:
                    tp.packages.set(sub_packages)

        return instance



class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    class Meta:
        model = Comment
        fields = ['id','username','content']

class WishlistSerializer(serializers.ModelSerializer):
    service_id = serializers.IntegerField(write_only=True, required=False)
    tour_id = serializers.IntegerField(write_only=True, required=False)
    service = serializers.SerializerMethodField()
    travel_tour = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'service_id', 'tour_id', 'service', 'travel_tour', 'created_at']

    def validate(self, attrs):
        service_id = attrs.pop('service_id', None) or attrs.pop('tour_id', None)
        if not service_id:
            raise serializers.ValidationError({'service_id': 'service_id is required.'})

        try:
            service = BaseService.objects.get(pk=service_id)
        except BaseService.DoesNotExist as exc:
            raise serializers.ValidationError({'service_id': 'Service does not exist.'}) from exc

        attrs['service'] = service
        attrs['travel_tour'] = self.get_concrete_tour(service)
        return attrs

    def get_service_type(self, service):
        if hasattr(service, 'traveltour'):
            return 'tour'
        if hasattr(service, 'hotel'):
            return 'hotel'
        if hasattr(service, 'transport'):
            return 'transport'
        return 'service'

    def get_base_price_display(self, service):
        return f"{service.base_price:,.0f}"

    def get_concrete_tour(self, service):
        try:
            return service.traveltour
        except TravelTour.DoesNotExist:
            return None

    def get_service(self, obj):
        service = obj.service
        return {
            'id': service.id,
            'name': service.name,
            'description': service.description,
            'star_rating': service.star_rating,
            'base_price': service.base_price,
            'base_price_display': self.get_base_price_display(service),
            'city': CityReadSerializer(service.city).data if service.city else None,
            'category': CategorySerializer(service.category).data if service.category else None,
            'type': self.get_service_type(service),
        }

    def get_travel_tour(self, obj):
        travel_tour = obj.travel_tour or self.get_concrete_tour(obj.service)
        if not travel_tour:
            return None

        data = TravelTourSimpleReadSerializer(travel_tour).data
        data['type'] = 'tour'
        return data

class HotelSimpleReadSerializer(serializers.ModelSerializer):
    city = CityReadSerializer()
    category = CategorySerializer()

    class Meta:
        model = Hotel
        fields = ['id','name','city','category']

class RoomTypeOptionReadSerializer(serializers.ModelSerializer):
    available_rooms = serializers.SerializerMethodField()

    def get_available_rooms(self, obj):
        return obj.rooms.filter(is_available = True).count()
    
    class Meta:
        model = RoomType
        fields = [
            'id',
            'name',
            'price',
            'available_rooms'
        ]        

class HotelRoomOptionReadSerializer(serializers.ModelSerializer):
    room_type = RoomTypeOptionReadSerializer(read_only=True)

    class Meta:
        model = Room
        fields = ['id','room_type','room_number','is_available','total_beds']


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



class HotelDetailReadSerializer(HotelSimpleReadSerializer):
    room_types = RoomTypeOptionReadSerializer(many=True, read_only=True)
    rooms = serializers.SerializerMethodField()
    images = ServiceImageSerializer(many=True, read_only=True)

    def get_rooms(self, obj):
        rooms = obj.rooms.filter(is_available=True).select_related('room_type')
        return HotelRoomOptionReadSerializer(rooms, many=True).data

    class Meta:
        model = Hotel
        fields = HotelSimpleReadSerializer.Meta.fields + [
            'description',
            'star_rating',
            'base_price',
            'address_detail',
            'is_active',
            'created_at',
            'updated_at',
            'total_rooms',
            'room_types',
            'rooms',
            'images'
        ]


class HotelWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = [
            'name', 'description', 'base_price',
            'address_detail', 'city',
        ]


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
            'vehicle_type',
            'is_active',
            'created_at',
            'updated_at',
            'total_seats',
            'routes',
            'seat_types',
            'availability',
        ]


class RouteNestedWriteSerializer(serializers.ModelSerializer):
    """Nested inside Transport write."""
    class Meta:
        model = Route
        fields = ['from_city', 'to_city', 'departure_time', 'arrival_time']


class TransportWriteSerializer(serializers.ModelSerializer):
    routes = RouteNestedWriteSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = Transport
        fields = [
            'name',
            'description',
            'base_price',
            'city',
            'brand_name',
            'license_plate',
            'vehicle_type',
            'routes',
        ]

    def create(self, validated_data):
        routes_data = validated_data.pop('routes', [])
        transport = Transport.objects.create(**validated_data)
        for route_data in routes_data:
            Route.objects.create(transport=transport, **route_data)
        return transport

    def update(self, instance, validated_data):
        routes_data = validated_data.pop('routes', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

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


class SeatTypeReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatType
        fields = ['id', 'name', 'price']

