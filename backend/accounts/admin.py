from django.contrib import admin
from .models import ProviderProfile, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'is_staff', 'is_provider', 'is_approved']
    list_filter = ['is_staff', 'is_provider', 'is_customer', 'is_approved']
    search_fields = ['username', 'email', 'first_name', 'last_name']


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'business_name', 'tax_code', 'is_verified', 'created_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['business_name', 'tax_code', 'user__username', 'user__email']