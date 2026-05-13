from bookings.models import Booking
from rest_framework import serializers


class BookingReadSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()
    room_type = serializers.SerializerMethodField()
    seat_type = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "service",
            "room_type",
            "seat_type",
            "quantity",
            "total_price",
            "booking_status",
            "payment_status",
            "created_date",
            "updated_date",
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

        service_type = "service"

        if hasattr(service, 'TravelTour'):
            service_type = "tour"

            start_date = service.TravelTour.time_start
            end_date = getattr(service.TravelTour, 'time_end', None)

        elif hasattr(service, 'Hotel'):
            service_type = "hotel"
        elif hasattr(service, 'Transport'):
            service_type = "transport"
        elif service.category:
            service_type = service.category.name

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

    def get_seat_type(self, obj):
        if not obj.seat_type:
            return None

        return {
            "id": obj.seat_type.id,
            "name": obj.seat_type.name,
            "price": obj.seat_type.price
        }


class BookingCreateSerializer(serializers.ModelSerializer):
    service = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())
    room_type = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all(), required=False, allow_null=True)
    seat_type = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all(), required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, default=1)

    class Meta:
        model = Booking
        fields =[
            "service",
            "room_type",
            "seat_type",
            "quantity"
        ]

    def validate(self, attrs):
        service = attrs.get('service')
        room_type = attrs.get('room_type')
        seat_type = attrs.get('seat_type')

        if not service.is_active:
            raise serializers.ValidationError(
                {"service": "Dịch vụ hiện không hoạt động"}
            )
        if room_type and seat_type:
            raise serializers.ValidationError(
                "Chỉ được chọn một trong hai: room_type hoặc seat_type"
            )
        if room_type:
            hotel = getattr(service, 'Hotel', None)
            if hotel is None:
                raise serializers.ValidationError(
                    {"room_type": "Chỉ booking Khách Sạn mới được chọn room_type"}
                )
            if room_type.hotel_id != hotel.id:
                raise serializers.ValidationError(
                    {"room_type": "room_type không thuộc về Khách Sạn này"}
                )
        if seat_type:
            transport = getattr(service, 'Transport', None)
            if transport is None:
                raise serializers.ValidationError(
                    {"seat_type": "Chỉ booking Phương Tiện mới được chọn seat_type"}
                )
            if seat_type.transport_id != transport.id:
                raise serializers.ValidationError(
                    {"seat_type": "seat_type không thuộc về Phương Tiện này"}
                )
            
        return attrs


    def calculate_total_price(self,validated_data):
        service = validated_data.get('service')
        room_type = validated_data.get('room_type')
        seat_type = validated_data.get('seat_type')
        quantity = validated_data.get('quantity', 1)

        unit_price = service.base_price

        if room_type:
            unit_price = room_type.price
        elif seat_type:
            unit_price = seat_type.price + service.base_price

        total_price = unit_price * quantity
        return total_price
    

    def create(self, validated_data):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Người dùng chưa đăng nhập")
        
        validated_data['user'] = request.user
        validated_data['total_price'] = self.calculate_total_price(validated_data)

        booking = Booking.objects.create(**validated_data)
        return booking



    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.total_price = self.calculate_total_price({
            'service': instance.service,
            'room_type': instance.room_type,
            'seat_type': instance.seat_type,
            'quantity': instance.quantity
        })
        instance.save()

        return instance
