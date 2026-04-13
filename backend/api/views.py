from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Room, Reservation


def room_to_dict(room, request):
    return {
        "id": room.id, "room_number": room.room_number, "room_type": room.room_type,
        "description": room.description, "floor": room.floor,
        "size_sqm": str(room.size_sqm) if room.size_sqm else None, "bed_type": room.bed_type,
        "price": str(room.price), "capacity": room.capacity, "available": room.available,
        "image":  request.build_absolute_uri(room.image.url)  if room.image  else None,
        "image2": request.build_absolute_uri(room.image2.url) if room.image2 else None,
        "image3": request.build_absolute_uri(room.image3.url) if room.image3 else None,
        "image4": request.build_absolute_uri(room.image4.url) if room.image4 else None,
        "wifi": room.wifi, "ac": room.ac, "tv": room.tv, "balcony": room.balcony,
        "minibar": room.minibar, "safe": room.safe, "bathtub": room.bathtub,
        "jacuzzi": room.jacuzzi, "sea_view": room.sea_view,
        "breakfast_included": room.breakfast_included, "pet_friendly": room.pet_friendly,
        "smoking_allowed": room.smoking_allowed, "rating": str(room.rating),
        "total_reviews": room.total_reviews,
        "created_at": room.created_at.isoformat(), "updated_at": room.updated_at.isoformat(),
    }


@api_view(['GET'])
def get_rooms(request):
    rooms = Room.objects.all()
    for f, q in [('room_type','room_type'),('min_price','price__gte'),('max_price','price__lte'),('capacity','capacity__gte')]:
        v = request.query_params.get(f)
        if v: rooms = rooms.filter(**{q: v})
    av = request.query_params.get('available')
    if av is not None: rooms = rooms.filter(available=(av.lower()=='true'))
    return Response([room_to_dict(r, request) for r in rooms])


@api_view(['GET'])
def get_room_detail(request, id):
    return Response(room_to_dict(get_object_or_404(Room, id=id), request))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reservation(request):
    d = request.data
    room = get_object_or_404(Room, id=d.get('room_id'))
    guests = int(d.get('guests', 1))

    if guests > room.capacity:
        return Response({"error": f"Room capacity is {room.capacity} guests max."}, status=400)

    if Reservation.objects.filter(room=room, check_in__lt=d.get('check_out'), check_out__gt=d.get('check_in')).exists():
        return Response({"error": "Room already booked for those dates."}, status=400)

    r = Reservation.objects.create(
        user=request.user, room=room,
        check_in=d.get('check_in'), check_out=d.get('check_out'),
        guests=guests, special_requests=d.get('special_requests', ''),
        # 🔥 Payment fields
        payment_method=d.get('payment_method', 'pay_at_hotel'),
        payment_status=d.get('payment_status', 'pay_at_hotel'),
        amount_paid=d.get('amount_paid', 0),
    )
    return Response({"message": "Booking successful!", "reservation_id": r.id, "payment_status": r.payment_status})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reservations(request):
    data = []
    for r in Reservation.objects.filter(user=request.user).select_related('room'):
        data.append({
            "id": r.id, "room_id": r.room.id, "room_number": r.room.room_number,
            "room_type": r.room.room_type, "check_in": str(r.check_in),
            "check_out": str(r.check_out), "guests": r.guests,
            "special_requests": r.special_requests, "price_per_night": str(r.room.price),
            "payment_method": r.payment_method, "payment_status": r.payment_status,
            "amount_paid": str(r.amount_paid), "created_at": r.created_at.isoformat(),
        })
    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, id):
    get_object_or_404(Reservation, id=id, user=request.user).delete()
    return Response({"message": "Booking cancelled."})


@api_view(['POST'])
def register_user(request):
    d = request.data
    if User.objects.filter(username=d.get('username')).exists():
        return Response({"error": "Username already exists."}, status=400)
    User.objects.create_user(username=d.get('username'), email=d.get('email'), password=d.get('password'))
    return Response({"message": "User created successfully."})


@api_view(['POST'])
def login_user(request):
    user = authenticate(username=request.data.get('username'), password=request.data.get('password'))
    if user is None:
        return Response({"error": "Invalid credentials."}, status=401)
    refresh = RefreshToken.for_user(user)
    return Response({"access": str(refresh.access_token), "refresh": str(refresh)})