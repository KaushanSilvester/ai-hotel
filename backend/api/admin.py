from django.contrib import admin
from .models import Room, Reservation, Review


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display  = ('room_type', 'room_number', 'price', 'capacity', 'available', 'rating', 'total_reviews')
    list_filter   = ('available', 'room_type')
    search_fields = ('room_type', 'room_number')


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display  = ('user', 'room', 'check_in', 'check_out', 'guests', 'payment_status', 'amount_paid')
    list_filter   = ('payment_status', 'payment_method')
    search_fields = ('user__username', 'room__room_type')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ('user', 'room', 'rating', 'title', 'created_at')
    list_filter   = ('rating',)
    search_fields = ('user__username', 'room__room_type', 'comment')

from .models import AdminNotification
admin.site.register(AdminNotification)