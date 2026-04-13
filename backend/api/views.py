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
            "available": room.available,

            # 🔥 IMAGES
            "image": request.build_absolute_uri(room.image.url) if room.image else None,
            "image2": request.build_absolute_uri(room.image2.url) if room.image2 else None,
            "image3": request.build_absolute_uri(room.image3.url) if room.image3 else None,

            "wifi": room.wifi,
            "ac": room.ac,
            "tv": room.tv,
        })

    return Response(data)

from .models import Reservation
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404


from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # 🔥 PROTECT API
def create_reservation(request):
    user = request.user  # 🔥 GET LOGGED USER
    room_id = request.data.get('room_id')
    check_in = request.data.get('check_in')
    check_out = request.data.get('check_out')

    room = get_object_or_404(Room, id=room_id)

    existing = Reservation.objects.filter(
        room=room,
        check_in__lt=check_out,
        check_out__gt=check_in
    )

    if existing.exists():
        return Response({"error": "Room already booked"}, status=400)

    Reservation.objects.create(
        user=user,
        room=room,
        check_in=check_in,
        check_out=check_out
    )

    return Response({"message": "Booking successful"})




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

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reservations(request):
    user = request.user

    reservations = Reservation.objects.filter(user=user)

    data = []
    for r in reservations:
        data.append({
            "id": r.id,
            "room": r.room.room_type,
            "check_in": str(r.check_in),
            "check_out": str(r.check_out),
        })

    return Response(data)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, id):
    reservation = get_object_or_404(Reservation, id=id, user=request.user)
    reservation.delete()

    return Response({"message": "Booking cancelled"})