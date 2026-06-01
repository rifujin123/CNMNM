from bookings.models import Booking
from rest_framework import serializers
from services.models import BaseService, RoomType, SeatType, TourPackage, Route, Room
from bookings.services import BookingService

class BookingReadSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()
    room_type = serializers.SerializerMethodField()
    seat_type = serializers.SerializerMethodField()
    tour_package = serializers.SerializerMethodField()
    route = serializers.SerializerMethodField()
    rooms = serializers.SerializerMethodField()
    seats = serializers.SerializerMethodField()
    latest_payment = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "service",
            "tour_package",
            "route",
            "rooms",
            "seats",
            "room_type",
            "seat_type",
            "quantity",
            "total_price",
            "booking_status",
            "payment_status",
            "created_date",
            "updated_date",
            "expires_at",
            "latest_payment"
        ]

    def get_user(self, obj):
        user = obj.user
        return {
            "id": user.id,
            "username": getattr(user, 'username', None),
            "email": getattr(user, 'email', None),
            "full_name": getattr(user, 'get_full_name', lambda: None)(),
            "phone": getattr(user, 'phone_number', None)
            }
    
    def get_service(self, obj):
        service = obj.service

        service_type, concrete_service = BookingService.get_service_type(service)
        start_date = None
        end_date = None

        if service_type == "tour":
            start_date = concrete_service.time_start
            end_date = getattr(concrete_service, "time_end", None)

        elif service_type not in ["hotel", "transport"]:
            service_type = service.category.name if service.category else "service"

        first_image = service.images.first()
        image_url = first_image.image.url if first_image else None

        return {
            "id": service.id,
            "name": service.name,
            "service_type": service_type,
            "base_price": service.base_price,
            "image_url": image_url,
            "provider": service.provider_id,
            "city": service.city.name if service.city else None,
            "category": service.category.name if service.category else None,
            "is_active": service.is_active,
            "start_date": start_date,
            "end_date": end_date
        }

    def get_room_type(self, obj):
        if not obj.room_type:
            return None
        
        return{
            "id": obj.room_type.id,
            "name": obj.room_type.name,
            "price": obj.room_type.price
        }
    
    def get_rooms(self, obj):
        return [
            {
            "id": room.id,
            "room_number": room.room_number,
            "hotel": {
                "id": room.hotel.id,
                "name": room.hotel.name
            },
            "room_type": {
                "id": room.room_type.id,
                "name": room.room_type.name
            }
        }
            for room in obj.rooms.all()
        ]

    def get_seat_type(self, obj):
        if not obj.seat_type:
            return None

        return {
            "id": obj.seat_type.id,
            "name": obj.seat_type.name,
            "price": obj.seat_type.price
        }
    
    def get_route(self, obj):
        if not obj.route:
            return None

        return {
            "id": obj.route.id,
            "from_city": obj.route.from_city.name if obj.route.from_city else None,
            "to_city": obj.route.to_city.name if obj.route.to_city else None,
            "departure_time": obj.route.departure_time,
            "arrival_time": obj.route.arrival_time,
        }

    def get_seats(self, obj):
        return [
            {
                "id": seat_status.id,
                "status": seat_status.status,
                "seat_number": seat_status.physical_seat.seat_number,
                "seat_type": {
                    "id": seat_status.physical_seat.seat_type.id,
                    "name": seat_status.physical_seat.seat_type.name,
                    "price": seat_status.physical_seat.seat_type.price,
            } if seat_status.physical_seat.seat_type else None,
        }
            for seat_status in obj.seat_statuses.all()
        ]
    
    def get_tour_package(self, obj):
        if not obj.tour_package:
            return None

        return {
            "id": obj.tour_package.id,
            "name": obj.tour_package.name,
            "price": obj.tour_package.price
        }
    
    def get_latest_payment(self, obj):
        payment = obj.payments.order_by("-created_at").first()

        if not payment:
            return None

        return {
            "id": payment.id,
            "payment_method": payment.payment_method,
            "payment_status": payment.payment_status,
            "amount": str(payment.amount),
            "transaction_id": payment.transaction_id,
            "expires_at": payment.expires_at,
        }


class BookingCreateSerializer(serializers.ModelSerializer):
    service = serializers.PrimaryKeyRelatedField(queryset=BaseService.objects.all())
    room_type = serializers.PrimaryKeyRelatedField(queryset=RoomType.objects.all(), required=False, allow_null=True)
    seat_type = serializers.PrimaryKeyRelatedField(queryset=SeatType.objects.all(), required=False, allow_null=True)
    tour_package = serializers.PrimaryKeyRelatedField(queryset=TourPackage.objects.all(), required=False, allow_null=True)
    route = serializers.PrimaryKeyRelatedField(queryset=Route.objects.all(), required=False, allow_null=True)
    rooms = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all(), many=True, required=False)
    quantity = serializers.IntegerField(min_value=1, default=1)

    class Meta:
        model = Booking
        fields =[
            "service",
            "tour_package",
            "route",
            "rooms",
            "room_type",
            "seat_type",
            "quantity"
        ]

    def create(self, validated_data):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("User must be authenticated to create a booking.")
        
        return BookingService.create_booking(request.user, validated_data)

    def to_representation(self, instance):
        return BookingReadSerializer(
            instance,
            context=self.context,
        ).data
