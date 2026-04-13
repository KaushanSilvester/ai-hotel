from django.urls import path
from .views import (
    get_rooms,
    get_room_detail,
    create_reservation,
    register_user,
    login_user,
    my_reservations,
    cancel_reservation,
)

urlpatterns = [
    path('rooms/',                get_rooms),
    path('rooms/<int:id>/',       get_room_detail),   # 🔥 NEW: single room detail
    path('book/',                 create_reservation),
    path('register/',             register_user),
    path('login/',                login_user),
    path('my-bookings/',          my_reservations),
    path('cancel/<int:id>/',      cancel_reservation),
]