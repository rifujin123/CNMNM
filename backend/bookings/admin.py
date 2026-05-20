from django.contrib import admin,messages
from rest_framework.exceptions import ValidationError
from .models import Booking
from .services import BookingService


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user',
        'service',
        'quantity',
        'total_price',
        'booking_status',
        'payment_status',
        'created_date',
    ]

    list_filter = [
        'booking_status',
        'payment_status',
        'created_date',
    ]

    search_fields = [
        'user__username',
        'user__email',
        'service__name',
    ]

    readonly_fields = [
        'created_date',
        'updated_date',
        'total_price'
    ]

    filter_horizontal = ['rooms']

    fieldsets = [
        (
            'Thông tin booking',
            {
                'fields': [
                    'user',
                    'service',
                    'quantity',
                    'total_price',
                ]
            },
        ),
        (
            'Booking Tour',
            {
                'fields': [
                    'tour_package',
                ]
            },
        ),
        (
            'Booking Hotel',
            {
                'fields': [
                    'room_type',
                    'rooms',
                ]
            },
        ),
        (
            'Booking Transport',
            {
                'fields': [
                    'route',
                    'seat_type',
                ]
            },
        ),
        (
            'Trạng thái',
            {
                'fields': [
                    'booking_status',
                    'payment_status',
                ]
            },
        ),
        (
            'Thời gian',
            {
                'fields': [
                    'created_date',
                    'updated_date',
                ]
            },
        ),
    ]

    ordering = ['-created_date']

    def save_model(self, request, obj, form, change):
        data = {
            'service': obj.service,
            'quantity': obj.quantity,
            'tour_package': form.cleaned_data.get('tour_package'),
            'room_type': form.cleaned_data.get('room_type'),
            'rooms': form.cleaned_data.get('rooms'),
            'route': form.cleaned_data.get('route'),
            'seat_type': form.cleaned_data.get('seat_type'),
        }

        obj.total_price = BookingService.calculate_total_price(data)

        super().save_model(request, obj, form, change)