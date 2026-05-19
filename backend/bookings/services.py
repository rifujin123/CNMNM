from django.db import transaction
from bookings.models import Booking
from services.models import TravelTour,Room,SeatStatus
from rest_framework.exceptions import ValidationError
from django.utils import timezone

class BookingService:
    @classmethod
    def get_service_type(cls, service):
        if hasattr(service, 'traveltour'):
            return 'tour', service.traveltour

        if hasattr(service, 'hotel'):
            return 'hotel', service.hotel

        if hasattr(service, 'transport'):
            return 'transport', service.transport

        return 'base', service

    @classmethod
    def validate_booking_options(cls, data):
        service = data.get('service')

        if not service:
            raise ValidationError({'service': 'Booking cần chọn dịch vụ.'})

        service_type, concrete_service = cls.get_service_type(service)

        now = timezone.now()

        if not service.is_active:
            raise ValidationError({'service': 'Dịch vụ hiện không hoạt động.'})

        tour_package = data.get('tour_package')
        route = data.get('route')
        rooms = data.get('rooms') or []
        room_type = data.get('room_type')
        seat_type = data.get('seat_type')

        if service_type == 'tour':
            if concrete_service.time_start <= now:
                raise ValidationError({'service': 'Tour này đã hết hạn, không thể đặt.'})

            if concrete_service.empty_slot <= 0:
                raise ValidationError({'service': 'Tour này đã hết chỗ.'})
            
            if not tour_package:
                raise ValidationError({'tour_package': 'Tour cần chọn gói tour.'})

            if tour_package.tour_id != concrete_service.id:
                raise ValidationError({'tour_package': 'Gói tour không thuộc tour này.'})

            if route or rooms or room_type or seat_type:
                raise ValidationError('Tour chỉ được chọn tour_package.')

        elif service_type == 'hotel':
            if not rooms:
                raise ValidationError({'rooms': 'Hotel cần chọn phòng cụ thể.'})

            for room in rooms:
                if room.hotel_id != concrete_service.id:
                    raise ValidationError({'rooms': 'Có phòng không thuộc khách sạn này.'})

                if not room.is_available:
                    raise ValidationError({'rooms': f'Phòng {room.room_number} không còn trống.'})

                if room_type and room.room_type_id != room_type.id:
                    raise ValidationError({'room_type': 'Room type không khớp với phòng đã chọn.'})

            if tour_package or route or seat_type:
                raise ValidationError('Hotel chỉ được chọn rooms hoặc room_type.')

        elif service_type == 'transport':
            if not route:
                raise ValidationError({'route': 'Transport cần chọn route.'})
            
            if route.departure_time <= now:
                raise ValidationError({'route': 'Chuyến này đã khởi hành, không thể đặt.'})

            if route.transport_id != concrete_service.id:
                raise ValidationError({'route': 'Route không thuộc phương tiện này.'})

            if not seat_type:
                raise ValidationError({'seat_type': 'Transport cần chọn loại ghế.'})

            if seat_type.provider_id != service.provider_id:
                raise ValidationError({'seat_type': 'Seat type không thuộc provider của phương tiện.'})

            if tour_package or rooms or room_type:
                raise ValidationError('Transport chỉ được chọn route và seat_type.')

        else:
            raise ValidationError({'service': 'Loại dịch vụ không hỗ trợ booking.'})

        return service_type, concrete_service

    @classmethod
    def calculate_total_price(cls, data):
        service = data.get('service')
        service_type, concrete_service = cls.get_service_type(service)

        quantity = data.get('quantity') or 1
        tour_package = data.get('tour_package')
        rooms = data.get('rooms') or []
        seat_type = data.get('seat_type')

        if service_type == 'tour':
            return (service.base_price + tour_package.price) * quantity

        if service_type == 'hotel':
            return sum(room.room_type.price for room in rooms)

        if service_type == 'transport':
            return (service.base_price + seat_type.price) * quantity

        return service.base_price * quantity

    @classmethod
    def create_booking(cls, user, data):
        with transaction.atomic():
            service_type, concrete_service = cls.validate_booking_options(data)
            total_price = cls.calculate_total_price(data)
            
            booking_data = dict(data)
            rooms = booking_data.pop('rooms', [])

            booking = Booking.objects.create(
                user=user,
                total_price=total_price,
                booking_status=Booking.BookingStatus.PENDING,
                payment_status=Booking.PaymentStatus.UNPAID,
                **booking_data
            )

            if service_type == 'tour':
                cls.hold_tour_inventory(concrete_service, booking.quantity)

            elif service_type == 'hotel':
                cls.hold_hotel_inventory(booking, rooms)

            elif service_type == 'transport':
                cls.hold_transport_inventory(booking)

            return booking
        

    @classmethod
    def restore_inventory(cls, booking):
        service_type, concrete_service = cls.get_service_type(booking.service)

        if service_type == 'tour':
            tour = TravelTour.objects.select_for_update().get(pk=concrete_service.pk)
            tour.empty_slot += booking.quantity
            tour.save(update_fields=['empty_slot'])

        elif service_type == 'hotel':
            room_ids = booking.rooms.values_list('id', flat=True)
            Room.objects.select_for_update().filter(id__in=room_ids).update(is_available=True)

        elif service_type == 'transport':
            SeatStatus.objects.select_for_update().filter(
                booking=booking,
                status__in=[
                    SeatStatus.Status.HELD,
                    SeatStatus.Status.BOOKED,
                ]
            ).update(
                status=SeatStatus.Status.AVAILABLE,
                booking=None,
            )
            
    @classmethod
    def confirm_booking(cls, booking):
        # Only call after payment success. Do not expose this directly through booking API.
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)

            if booking.booking_status == Booking.BookingStatus.CONFIRMED:
                return booking

            if booking.booking_status != Booking.BookingStatus.PENDING:
                raise ValidationError('Chỉ booking pending mới được confirm.')

            booking.booking_status = Booking.BookingStatus.CONFIRMED
            booking.payment_status = Booking.PaymentStatus.PAID
            booking.save(update_fields=['booking_status', 'payment_status', 'updated_date'])

            SeatStatus.objects.filter(
                booking=booking,
                status=SeatStatus.Status.HELD,
            ).update(status=SeatStatus.Status.BOOKED)

            return booking

    @classmethod
    def cancel_booking(cls, booking):
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)

            if booking.payment_status == Booking.PaymentStatus.PAID:
                raise ValidationError(
                    "Booking đã thanh toán, cần xử lý hoàn tiền thay vì hủy trực tiếp."
                )

            if booking.booking_status == Booking.BookingStatus.COMPLETED:
                raise ValidationError('Không thể hủy booking đã hoàn thành.')

            if booking.booking_status in [
                Booking.BookingStatus.CANCELLED,
                Booking.BookingStatus.REFUNDED,
                Booking.BookingStatus.EXPIRED,
                Booking.BookingStatus.PAYMENT_FAILED,
            ]:
                return booking

            cls.restore_inventory(booking)

            booking.booking_status = Booking.BookingStatus.CANCELLED
            booking.save(update_fields=['booking_status', 'updated_date'])

            return booking

    @classmethod
    def complete_booking(cls, booking):
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)

            if booking.booking_status != Booking.BookingStatus.CONFIRMED:
                raise ValidationError('Chỉ booking confirmed mới được complete.')

            booking.booking_status = Booking.BookingStatus.COMPLETED
            booking.save(update_fields=['booking_status', 'updated_date'])

            return booking

    @classmethod
    def hold_tour_inventory(cls, tour, quantity):
        tour = TravelTour.objects.select_for_update().get(pk=tour.pk)

        if tour.empty_slot < quantity:
            raise ValidationError('Không đủ chỗ trống cho tour này.')

        tour.empty_slot -= quantity
        tour.save(update_fields=['empty_slot'])

    @classmethod
    def hold_hotel_inventory(cls, booking, rooms):
        room_ids = [room.id for room in rooms]
        
        locked_rooms = list(Room.objects.select_for_update().filter(id__in=room_ids))

        if len(locked_rooms) != len(room_ids):
            raise ValidationError({'rooms': 'Có phòng không tồn tại.'})
        
        for room in locked_rooms:
            if not room.is_available:
                raise ValidationError({'rooms': f'Phòng {room.room_number} không còn trống.'})
            
        Room.objects.filter(id__in=room_ids).update(is_available=False)
        booking.rooms.set(locked_rooms)

    @classmethod
    def hold_transport_inventory(cls, booking):
        seats = list(SeatStatus.objects.select_for_update()
                     .filter(route=booking.route,
                             physical_seat__seat_type=booking.seat_type,
                             status=SeatStatus.Status.AVAILABLE,
                             booking__isnull=True)
                             .order_by('physical_seat__seat_number')[:booking.quantity])
        
        if len(seats) < booking.quantity:
            raise ValidationError('Không đủ ghế trống cho lựa chọn này.')
        
        SeatStatus.objects.filter(id__in=[seat.id for seat in seats]).update(
            status=SeatStatus.Status.HELD,
            booking=booking
        )

    @classmethod
    def fail_booking(cls, booking):
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)
            
            if booking.payment_status == Booking.PaymentStatus.PAID:
                return booking

            if booking.booking_status == Booking.BookingStatus.PAYMENT_FAILED:
                return booking

            if booking.booking_status in [
                Booking.BookingStatus.CANCELLED,
                Booking.BookingStatus.REFUNDED,
                Booking.BookingStatus.EXPIRED,
                Booking.BookingStatus.COMPLETED,
            ]:
                return booking
            
            cls.restore_inventory(booking)

            booking.booking_status = Booking.BookingStatus.PAYMENT_FAILED
            booking.payment_status = Booking.PaymentStatus.FAILED
            booking.save(update_fields=['booking_status', 'payment_status', 'updated_date'])
            return booking
        
    @classmethod
    def refund_booking(cls, booking):
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)

            if booking.booking_status == Booking.BookingStatus.PAYMENT_FAILED:
                return booking
            
            if booking.booking_status in [
                Booking.BookingStatus.CANCELLED,
                Booking.BookingStatus.EXPIRED,
                Booking.BookingStatus.REFUNDED,
                Booking.BookingStatus.COMPLETED,
            ]:
                return booking
            
            cls.restore_inventory(booking)

            booking.booking_status = Booking.BookingStatus.REFUNDED
            booking.payment_status = Booking.PaymentStatus.REFUNDED
            booking.save(update_fields=['booking_status', 'payment_status', 'updated_date'])
            return booking
        
    @classmethod
    def expire_booking(cls, booking):
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)

            if booking.payment_status == Booking.PaymentStatus.PAID:
                return booking

            if booking.booking_status == Booking.BookingStatus.EXPIRED:
                return booking
            
            if booking.booking_status in [
                Booking.BookingStatus.CANCELLED,
                Booking.BookingStatus.REFUNDED,
                Booking.BookingStatus.COMPLETED,
            ]:
                return booking
            
            cls.restore_inventory(booking)

            booking.booking_status = Booking.BookingStatus.EXPIRED
            booking.save(update_fields=['booking_status', 'updated_date'])
            return booking
