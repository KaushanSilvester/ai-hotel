from django.urls import path
from .admin_views import (
    admin_stats,
    admin_reservations, admin_update_reservation, admin_delete_reservation,
    admin_rooms, admin_create_room, admin_update_room, admin_delete_room,
    admin_users, admin_toggle_user,
    admin_reviews, admin_delete_review,
)

urlpatterns = [
    # Dashboard stats
    path('stats/',                          admin_stats),

    # Reservations
    path('reservations/',                   admin_reservations),
    path('reservations/<int:id>/update/',   admin_update_reservation),
    path('reservations/<int:id>/delete/',   admin_delete_reservation),

    # Rooms
    path('rooms/',                          admin_rooms),
    path('rooms/create/',                   admin_create_room),
    path('rooms/<int:id>/update/',          admin_update_room),
    path('rooms/<int:id>/delete/',          admin_delete_room),

    # Users
    path('users/',                          admin_users),
    path('users/<int:id>/toggle/',          admin_toggle_user),

    # Reviews
    path('reviews/',                        admin_reviews),
    path('reviews/<int:id>/delete/',        admin_delete_review),
]