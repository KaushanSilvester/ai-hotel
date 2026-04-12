from django.urls import path
from .views import get_rooms
from .views import get_rooms, create_reservation
from .views import get_rooms, create_reservation, register_user, login_user

urlpatterns = [
    path('rooms/', get_rooms),
    path('book/', create_reservation),
    path('register/', register_user),
    path('login/', login_user),
]
