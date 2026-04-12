from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room
from .models import Reservation
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['GET'])
def get_rooms(request):
    rooms = Room.objects.all()

    data = []
    for room in rooms:
        data.append({
            "id": room.id,
            "room_type": room.room_type,
            "price": str(room.price),
            "capacity": room.capacity,
            "available": room.available
        })

    return Response(data)

from .models import Reservation
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404


@api_view(['POST'])
def create_reservation(request):
    user_id = request.data.get('user_id')
    room_id = request.data.get('room_id')
    check_in = request.data.get('check_in')
    check_out = request.data.get('check_out')

    user = get_object_or_404(User, id=user_id)
    room = get_object_or_404(Room, id=room_id)

    # 🔥 CHECK FOR EXISTING BOOKINGS
    existing = Reservation.objects.filter(
        room=room,
        check_in__lt=check_out,
        check_out__gt=check_in
    )

    if existing.exists():
        return Response({
            "error": "Room already booked for these dates"
        }, status=400)

    reservation = Reservation.objects.create(
        user=user,
        room=room,
        check_in=check_in,
        check_out=check_out
    )

    return Response({
        "message": "Reservation created successfully"
    })




@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response({"message": "User created successfully"})




@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })