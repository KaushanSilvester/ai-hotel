from django.urls import path
from .views import get_rooms

urlpatterns = [
    path('rooms/', get_rooms),
]