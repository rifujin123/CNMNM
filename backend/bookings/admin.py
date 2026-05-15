from django.contrib import admin,messages
from rest_framework.exceptions import ValidationError
from .models import Booking
from .services import BookingService


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
        'created_date',
    ]
    list_display_links = ['id', 'user_email']
    
    list_filter = [
        'booking_status',
        'payment_status',
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

    readonly_fields = ['booking_status','payment_status','created_date', 'updated_date']

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

    def _run_booking_service_action(self, request, queryset, service_method, success_message):
        success_count = 0
        errors = []

        for booking in queryset.iterator():
            try:
                service_method(booking)
                success_count += 1
            except ValidationError as exc:
                errors.append(f'Booking #{booking.pk}: {getattr(exc, "detail", exc)}')

        if success_count:
            self.message_user(request, f'{success_count} booking(s) {success_message}.', messages.SUCCESS)

        for error in errors[:5]:
            self.message_user(request, error, messages.ERROR)

        if len(errors) > 5:
            self.message_user(request, f'{len(errors) - 5} more booking(s) failed.', messages.ERROR)


    @admin.display(description='User email', ordering='user__email')
    def user_email(self, obj):
        return obj.user.email

    @admin.display(description='Provider', ordering='service__provider__email')
    def service_provider(self, obj):
        return obj.service.provider

    @admin.action(description='Mark selected bookings as confirmed')
    def mark_as_confirmed(self, request, queryset):
        self._run_booking_service_action(request,queryset,
                                         BookingService.confirm_booking, 'marked as confirmed')

    @admin.action(description='Mark selected bookings as cancelled')
    def mark_as_cancelled(self, request, queryset):
        self._run_booking_service_action(request,queryset,
                                         BookingService.cancel_booking, 'marked as cancelled')

    @admin.action(description='Mark selected bookings as paid')
    def mark_as_paid(self, request, queryset):
        self._run_booking_service_action(request,queryset,
                                         BookingService.confirm_booking, 'marked as paid')

    @admin.action(description='Mark selected bookings as refunded')
    def mark_as_refunded(self, request, queryset):
        self._run_booking_service_action(request,queryset,
                                         BookingService.refund_booking, 'marked as refunded')
