from django.contrib import admin
from .models import ProviderRevenue, ChatRoom, Message


@admin.register(ProviderRevenue)
class ProviderRevenueAdmin(admin.ModelAdmin):
    list_display = ['id', 'provider', 'period', 'period_value', 'total_bookings', 'total_revenue', 'calculated_at']
    list_filter = ['period', 'calculated_at']
    search_fields = ['provider__username']
    readonly_fields = ['calculated_at']


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'provider', 'customer', 'booking', 'last_message_at', 'created_at']
    list_filter = ['created_at']
    search_fields = ['provider__username', 'customer__username']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'room', 'sender', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__username', 'message']
    readonly_fields = ['created_at']