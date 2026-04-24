from django.contrib import admin
from .models import booking

class BookingAdmin(admin.ModelAdmin):
    list_display = ['user']
    list_filter = ['booking_status','created_date']

# Register your models here.
admin.site.register(booking, BookingAdmin)
