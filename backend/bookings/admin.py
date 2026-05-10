from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user_email',
        'service',
        'service_provider',
        'quantity',
        'total_price',
        'booking_status',
        'payment_status',
        'payment_method',
        'created_date',
    ]
    list_display_links = ['id', 'user_email']
    list_editable = ['booking_status', 'payment_status']
    list_filter = [
        'booking_status',
        'payment_status',
        'payment_method',
        'created_date',
        'updated_date',
    ]
    search_fields = [
        'user__username',
        'user__email',
        'service__name',
        'service__provider__username',
        'service__provider__email',
    ]
    readonly_fields = ['created_date', 'updated_date']
    raw_id_fields = ['user', 'service', 'room_type', 'seat_type']
    list_select_related = ['user', 'service', 'service__provider', 'room_type', 'seat_type']
    date_hierarchy = 'created_date'
    ordering = ['-created_date']
    actions = [
        'mark_as_confirmed',
        'mark_as_cancelled',
        'mark_as_paid',
        'mark_as_refunded',
    ]
    fieldsets = [
        (
            'Booking information',
            {
                'fields': [
                    'user',
                    'service',
                    'room_type',
                    'seat_type',
                    'quantity',
                    'total_price',
                ]
            },
        ),
        (
            'Status',
            {
                'fields': [
                    'booking_status',
                    'payment_status',
                    'payment_method',
                ]
            },
        ),
        (
            'Timestamps',
            {
                'fields': [
                    'created_date',
                    'updated_date',
                ]
            },
        ),
    ]

    @admin.display(description='User email', ordering='user__email')
    def user_email(self, obj):
        return obj.user.email

    @admin.display(description='Provider', ordering='service__provider__email')
    def service_provider(self, obj):
        return obj.service.provider

    @admin.action(description='Mark selected bookings as confirmed')
    def mark_as_confirmed(self, request, queryset):
        updated = queryset.update(booking_status=Booking.BookingStatus.CONFIRMED)
        self.message_user(request, f'{updated} booking(s) marked as confirmed.')

    @admin.action(description='Mark selected bookings as cancelled')
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.update(booking_status=Booking.BookingStatus.CANCELLED)
        self.message_user(request, f'{updated} booking(s) marked as cancelled.')

    @admin.action(description='Mark selected bookings as paid')
    def mark_as_paid(self, request, queryset):
        updated = queryset.update(payment_status=Booking.PaymentStatus.PAID)
        self.message_user(request, f'{updated} booking(s) marked as paid.')

    @admin.action(description='Mark selected bookings as refunded')
    def mark_as_refunded(self, request, queryset):
        updated = queryset.update(payment_status=Booking.PaymentStatus.REFUNDED)
        self.message_user(request, f'{updated} booking(s) marked as refunded.')
