from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Room, Reservation, Review


# ── Helper: build room dict ───────────────────────────────────────────────────
def room_dict(room, request):
    return {
        "id": room.id, "room_number": room.room_number,
        "room_type": room.room_type, "price": str(room.price),
        "capacity": room.capacity, "available": room.available,
        "rating": str(room.rating), "total_reviews": room.total_reviews,
        "floor": room.floor, "bed_type": room.bed_type,
        "image": request.build_absolute_uri(room.image.url) if room.image else None,
        "wifi": room.wifi, "ac": room.ac, "tv": room.tv,
        "balcony": room.balcony, "minibar": room.minibar,
        "sea_view": room.sea_view, "breakfast_included": room.breakfast_included,
        "pet_friendly": room.pet_friendly, "jacuzzi": room.jacuzzi,
        "safe": room.safe, "bathtub": room.bathtub,
    }


# ── DASHBOARD STATS ───────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    """Overall dashboard numbers."""
    today      = timezone.now().date()
    this_month = today.replace(day=1)

    total_revenue   = Reservation.objects.filter(payment_status='paid').aggregate(s=Sum('amount_paid'))['s'] or 0
    monthly_revenue = Reservation.objects.filter(payment_status='paid', created_at__date__gte=this_month).aggregate(s=Sum('amount_paid'))['s'] or 0
    checkins_today  = Reservation.objects.filter(check_in=today).count()
    checkouts_today = Reservation.objects.filter(check_out=today).count()
    occupancy_count = Reservation.objects.filter(check_in__lte=today, check_out__gt=today).count()
    total_rooms     = Room.objects.count()
    occupancy_rate  = round((occupancy_count / total_rooms * 100) if total_rooms else 0, 1)

    # Revenue last 7 days (for chart)
    revenue_chart = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        rev = Reservation.objects.filter(payment_status='paid', created_at__date=day).aggregate(s=Sum('amount_paid'))['s'] or 0
        revenue_chart.append({"date": str(day), "revenue": float(rev)})

    return Response({
        "total_reservations":   Reservation.objects.count(),
        "reservations_today":   Reservation.objects.filter(created_at__date=today).count(),
        "total_revenue":        float(total_revenue),
        "monthly_revenue":      float(monthly_revenue),
        "checkins_today":       checkins_today,
        "checkouts_today":      checkouts_today,
        "occupancy_rate":       occupancy_rate,
        "total_rooms":          total_rooms,
        "available_rooms":      Room.objects.filter(available=True).count(),
        "total_users":          User.objects.filter(is_staff=False).count(),
        "total_reviews":        Review.objects.count(),
        "avg_rating":           float(Room.objects.aggregate(a=Avg('rating'))['a'] or 0),
        "revenue_chart":        revenue_chart,
        "pending_bookings":     Reservation.objects.filter(payment_status='pending').count(),
    })


# ── RESERVATIONS ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_reservations(request):
    """List all reservations with filters."""
    qs = Reservation.objects.select_related('user', 'room').order_by('-created_at')

    status = request.query_params.get('status')
    if status: qs = qs.filter(payment_status=status)

    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(user__username__icontains=search) | qs.filter(room__room_type__icontains=search)

    data = [{
        "id":             r.id,
        "username":       r.user.username,
        "email":          r.user.email,
        "room_type":      r.room.room_type,
        "room_number":    r.room.room_number,
        "check_in":       str(r.check_in),
        "check_out":      str(r.check_out),
        "guests":         r.guests,
        "payment_method": r.payment_method,
        "payment_status": r.payment_status,
        "amount_paid":    str(r.amount_paid),
        "created_at":     r.created_at.isoformat(),
        "special_requests": r.special_requests,
    } for r in qs]
    return Response(data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_update_reservation(request, id):
    """Update payment status of a reservation."""
    try:
        r = Reservation.objects.get(id=id)
    except Reservation.DoesNotExist:
        return Response({"error": "Not found."}, status=404)
    status = request.data.get('payment_status')
    if status: r.payment_status = status; r.save()
    return Response({"message": "Updated.", "payment_status": r.payment_status})


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_reservation(request, id):
    """Delete a reservation."""
    try:
        Reservation.objects.get(id=id).delete()
        return Response({"message": "Deleted."})
    except Reservation.DoesNotExist:
        return Response({"error": "Not found."}, status=404)


# ── ROOMS ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_rooms(request):
    """List all rooms."""
    rooms = Room.objects.all().order_by('room_type')
    return Response([room_dict(r, request) for r in rooms])


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_room(request):
    """Create a new room — supports image upload via multipart/form-data."""
    d = request.data
    try:
        room = Room.objects.create(
            room_number=d.get('room_number'),
            room_type=d.get('room_type', 'single'),
            description=d.get('description', ''),
            floor=d.get('floor') or None,
            bed_type=d.get('bed_type', 'King Bed'),
            price=d.get('price', 0),
            capacity=d.get('capacity', 1),
            available=d.get('available') not in [False, 'false', 'False', '0'],
            wifi=d.get('wifi') in [True, 'true', 'True', '1'],
            ac=d.get('ac') in [True, 'true', 'True', '1'],
            tv=d.get('tv') in [True, 'true', 'True', '1'],
            balcony=d.get('balcony') in [True, 'true', 'True', '1'],
            minibar=d.get('minibar') in [True, 'true', 'True', '1'],
            sea_view=d.get('sea_view') in [True, 'true', 'True', '1'],
            breakfast_included=d.get('breakfast_included') in [True, 'true', 'True', '1'],
            pet_friendly=d.get('pet_friendly') in [True, 'true', 'True', '1'],
            jacuzzi=d.get('jacuzzi') in [True, 'true', 'True', '1'],
            safe=d.get('safe') in [True, 'true', 'True', '1'],
        )
        # 🔥 Handle image uploads
        if 'image' in request.FILES:
            room.image = request.FILES['image']
        if 'image2' in request.FILES:
            room.image2 = request.FILES['image2']
        if 'image3' in request.FILES:
            room.image3 = request.FILES['image3']
        if 'image4' in request.FILES:
            room.image4 = request.FILES['image4']
        room.save()
        return Response({"message": "Room created.", "id": room.id}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_update_room(request, id):
    """Update a room."""
    try:
        room = Room.objects.get(id=id)
    except Room.DoesNotExist:
        return Response({"error": "Not found."}, status=404)

    updatable = ['room_number','room_type','description','floor','bed_type','price',
                 'capacity','available','wifi','ac','tv','balcony','minibar',
                 'sea_view','breakfast_included','pet_friendly','jacuzzi','safe']
    for field in updatable:
        if field in request.data:
            setattr(room, field, request.data[field])
    # 🔥 Handle image uploads on update too
    if 'image' in request.FILES:
        room.image = request.FILES['image']
    if 'image2' in request.FILES:
        room.image2 = request.FILES['image2']
    if 'image3' in request.FILES:
        room.image3 = request.FILES['image3']
    if 'image4' in request.FILES:
        room.image4 = request.FILES['image4']
    room.save()
    return Response({"message": "Room updated."})


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_room(request, id):
    """Delete a room."""
    try:
        Room.objects.get(id=id).delete()
        return Response({"message": "Room deleted."})
    except Room.DoesNotExist:
        return Response({"error": "Not found."}, status=404)


# ── USERS ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users(request):
    """List all non-staff users."""
    users = User.objects.filter(is_staff=False).order_by('-date_joined')
    data = [{
        "id":           u.id,
        "username":     u.username,
        "email":        u.email,
        "date_joined":  u.date_joined.isoformat(),
        "is_active":    u.is_active,
        "booking_count": Reservation.objects.filter(user=u).count(),
        "total_spent":   float(Reservation.objects.filter(user=u, payment_status='paid').aggregate(s=Sum('amount_paid'))['s'] or 0),
    } for u in users]
    return Response(data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_toggle_user(request, id):
    """Activate or deactivate a user."""
    try:
        u = User.objects.get(id=id, is_staff=False)
        u.is_active = not u.is_active
        u.save()
        return Response({"message": "Updated.", "is_active": u.is_active})
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)


# ── REVIEWS ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_reviews(request):
    """List all reviews."""
    reviews = Review.objects.select_related('user', 'room').order_by('-created_at')
    data = [{
        "id":         r.id,
        "username":   r.user.username,
        "room_type":  r.room.room_type,
        "rating":     r.rating,
        "title":      r.title,
        "comment":    r.comment,
        "created_at": r.created_at.isoformat(),
    } for r in reviews]
    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_review(request, id):
    """Delete any review."""
    try:
        Review.objects.get(id=id).delete()
        return Response({"message": "Review deleted."})
    except Review.DoesNotExist:
        return Response({"error": "Not found."}, status=404)