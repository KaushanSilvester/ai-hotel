from django.urls import path
from .views import (
    get_rooms,
    create_reservation,
    register_user,
    login_user,
    my_reservations,
    cancel_reservation  # 🔥 ADD THIS
)

urlpatterns = [
    path('rooms/', get_rooms),
    path('book/', create_reservation),
    path('register/', register_user),
    path('login/', login_user),
    path('my-bookings/', my_reservations),
    path('cancel/<int:id>/', cancel_reservation),
]