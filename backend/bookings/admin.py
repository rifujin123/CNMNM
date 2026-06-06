from django.contrib import admin
from .models import Booking, BookingItem, BookingReview


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
        'created_at',
    ]

    list_filter = [
        'booking_status',
        'payment_status',
        'created_at',
    ]

    search_fields = [
        'user__username',
        'user__email',
        'service__name',
    ]

    readonly_fields = [
        'created_at',
        'updated_at',
    ]

    fieldsets = [
        (
            'Thông tin booking',
            {
                'fields': [
                    'user',
                    'service',
                    'quantity',
                    'unit_price',
                    'total_price',
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
            'Hủy booking',
            {
                'fields': [
                    'cancellation_reason',
                    'cancelled_at',
                ]
            },
        ),
        (
            'Thời gian',
            {
                'fields': [
                    'expires_at',
                    'notes',
                    'created_at',
                    'updated_at',
                ]
            },
        ),
    ]

    ordering = ['-created_at']


@admin.register(BookingItem)
class BookingItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'item_type', 'item_id', 'quantity', 'price']
    list_filter = ['item_type']
    search_fields = ['booking__id']


@admin.register(BookingReview)
class BookingReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['user__username', 'content']
    readonly_fields = ['created_at']