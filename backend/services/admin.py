from django.contrib import admin
from .models import (
    Category,
    Package,
    TourPackage,
    TravelTour,
    Hotel,
    Transport,
    RoomType,
    Room,
    SeatType,
    Route,
    Comment,
    ServiceImage,
    PromoBanner,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(TravelTour)
class TravelTourAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'provider', 'city', 'category', 'base_price', 'empty_slot', 'is_active']
    list_filter = ['is_active', 'city', 'category', 'provider']
    search_fields = ['name', 'description', 'provider__username']


@admin.register(TourPackage)
class TourPackageAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'tour', 'price']
    list_filter = ['tour__city', 'tour__provider']
    search_fields = ['name', 'tour__name', 'tour__provider__username']
    filter_horizontal = ['packages']


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'provider', 'city', 'base_price', 'is_active']
    list_filter = ['is_active', 'city', 'provider']
    search_fields = ['name', 'description', 'provider__username']


@admin.register(Transport)
class TransportAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'provider', 'city', 'brand_name', 'vehicle_type', 'is_active']
    list_filter = ['is_active', 'city', 'provider', 'vehicle_type']
    search_fields = ['name', 'brand_name', 'license_plate', 'provider__username']


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'hotel', 'name', 'price']
    list_filter = ['hotel', 'hotel__city']
    search_fields = ['name', 'hotel__name']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'hotel', 'room_type', 'room_number', 'is_available', 'total_beds']
    list_filter = ['is_available', 'hotel']
    search_fields = ['room_number', 'hotel__name', 'room_type__name']


@admin.register(SeatType)
class SeatTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'provider', 'name', 'price']
    list_filter = ['provider']
    search_fields = ['name', 'provider__username']


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['id', 'transport', 'from_city', 'to_city', 'departure_time', 'arrival_time']
    list_filter = ['from_city', 'to_city', 'transport']
    search_fields = ['transport__name', 'from_city__name', 'to_city__name']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'travel_tour']
    list_filter = ['travel_tour', 'user']
    search_fields = ['user__username', 'travel_tour__name', 'content']


@admin.register(ServiceImage)
class ServiceImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'service', 'caption', 'created_at']
    list_filter = ['created_at', 'service__category']
    search_fields = ['caption', 'service__name']


@admin.register(PromoBanner)
class PromoBannerAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'is_active', 'display_order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'subtitle', 'cta_text']
