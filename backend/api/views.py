from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Room, Reservation, Review


# ── Helpers ───────────────────────────────────────────────────────────────────

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


def send_booking_confirmation(user, room, reservation):
    """Send a beautiful HTML confirmation email via Gmail."""
    nights = (reservation.check_out - reservation.check_in).days
    subtotal = float(room.price) * nights
    tax = round(subtotal * 0.1)
    total = subtotal + tax

    subject = f"✅ Booking Confirmed — {room.room_type} | HotelAI"

    # Plain text fallback
    text_body = f"""
Hi {user.username},

Your booking is confirmed! Here are your details:

Room:        {room.room_type}{f' (Room {room.room_number})' if room.room_number else ''}
Check-in:    {reservation.check_in}
Check-out:   {reservation.check_out}
Nights:      {nights}
Guests:      {reservation.guests}
Payment:     {'Paid online' if reservation.payment_status == 'paid' else 'Pay at hotel'}
Total:       Rs. {int(total):,}

Thank you for choosing HotelAI!
"""

    # HTML email
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }}
    .wrapper {{ max-width: 560px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }}
    .header {{ background: #0f172a; padding: 28px 32px; text-align: center; }}
    .header h1 {{ color: #fff; font-size: 22px; margin: 0; letter-spacing: -0.3px; }}
    .header p  {{ color: #94a3b8; font-size: 13px; margin: 6px 0 0; }}
    .badge {{ display: inline-block; background: #22c55e; color: #fff; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px; margin: 24px auto 0; }}
    .body {{ padding: 28px 32px; }}
    .greeting {{ font-size: 16px; color: #111827; margin-bottom: 20px; }}
    .detail-box {{ background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; }}
    .detail-row {{ display: flex; justify-content: space-between; font-size: 14px; color: #374151; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }}
    .detail-row:last-child {{ border-bottom: none; }}
    .detail-label {{ color: #6b7280; }}
    .detail-value {{ font-weight: 600; color: #111827; }}
    .total-row {{ background: #111827; border-radius: 10px; padding: 14px 20px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 20px; }}
    .payment-badge {{ display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }}
    .paid    {{ background: #dcfce7; color: #16a34a; }}
    .hotel   {{ background: #fef3c7; color: #92400e; }}
    .footer  {{ background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }}
    .footer a {{ color: #2563eb; text-decoration: none; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🏨 HotelAI</h1>
      <p>Your booking is confirmed</p>
      <div class="badge">✓ Booking Confirmed</div>
    </div>
    <div class="body">
      <p class="greeting">Hi <strong>{user.username}</strong>, great news — your room is booked!</p>

      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Room</span>
          <span class="detail-value">{room.room_type}{f" · Room {room.room_number}" if room.room_number else ""}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in</span>
          <span class="detail-value">{reservation.check_in.strftime("%A, %d %B %Y")}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out</span>
          <span class="detail-value">{reservation.check_out.strftime("%A, %d %B %Y")}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">{nights} night{"s" if nights > 1 else ""}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Guests</span>
          <span class="detail-value">{reservation.guests} guest{"s" if reservation.guests > 1 else ""}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Room Rate</span>
          <span class="detail-value">Rs. {int(room.price):,} / night</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Taxes & Fees (10%)</span>
          <span class="detail-value">Rs. {tax:,}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment</span>
          <span class="detail-value">
            <span class="payment-badge {'paid' if reservation.payment_status == 'paid' else 'hotel'}">
              {"✓ Paid Online" if reservation.payment_status == "paid" else "🏨 Pay at Hotel"}
            </span>
          </span>
        </div>
      </div>

      <div class="total-row">
        <span>Total Amount</span>
        <span>Rs. {int(total):,}</span>
      </div>

      {"<p style='font-size:13px;color:#6b7280;background:#fef3c7;border-radius:8px;padding:10px 14px;'>⏰ <strong>Reminder:</strong> Payment of Rs. " + f"{int(total):,}" + " is due at check-in.</p>" if reservation.payment_status == "pay_at_hotel" else ""}

      <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">
        Need help? Reply to this email or contact our 24/7 support.<br/>
        We look forward to welcoming you!
      </p>
    </div>
    <div class="footer">
      <p>© 2026 HotelAI · <a href="http://localhost:3000">Visit Website</a></p>
      <p style="margin-top:6px;">This email was sent to confirm your booking. Please keep it for your records.</p>
    </div>
  </div>
</body>
</html>
"""

    try:
        send_mail(
            subject=subject,
            message=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_body,
            fail_silently=False,
        )
    except Exception as e:
        # Don't crash the booking if email fails — just log it
        print(f"[EMAIL ERROR] Could not send confirmation to {user.email}: {e}")


# ── Room Endpoints ─────────────────────────────────────────────────────────────

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


# ── Reservation Endpoints ──────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reservation(request):
    d    = request.data
    room = get_object_or_404(Room, id=d.get('room_id'))
    guests = int(d.get('guests', 1))

    if guests > room.capacity:
        return Response({"error": f"Room capacity is {room.capacity} guests max."}, status=400)

    if Reservation.objects.filter(
        room=room,
        check_in__lt=d.get('check_out'),
        check_out__gt=d.get('check_in')
    ).exists():
        return Response({"error": "Room already booked for those dates."}, status=400)

    reservation = Reservation.objects.create(
        user=request.user, room=room,
        check_in=d.get('check_in'), check_out=d.get('check_out'),
        guests=guests, special_requests=d.get('special_requests', ''),
        payment_method=d.get('payment_method', 'pay_at_hotel'),
        payment_status=d.get('payment_status', 'pay_at_hotel'),
        amount_paid=d.get('amount_paid', 0),
    )

    # 🔥 Send confirmation email — wrapped so it NEVER crashes the booking
    try:
        if request.user.email and "@" in str(request.user.email):
            send_booking_confirmation(request.user, room, reservation)
    except Exception as email_err:
        # Email failure must never affect the booking response
        print(f"[EMAIL SKIPPED] {email_err}")

    return Response({
        "message": "Booking successful!",
        "reservation_id": reservation.id,
        "payment_status": reservation.payment_status,
    })


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


# ── 🔥 Review Endpoints ────────────────────────────────────────────────────────

@api_view(['GET'])
def get_reviews(request, room_id):
    """Get all reviews for a room."""
    room    = get_object_or_404(Room, id=room_id)
    reviews = Review.objects.filter(room=room).select_related('user')
    data = [{
        "id":         r.id,
        "username":   r.user.username,
        "rating":     r.rating,
        "title":      r.title,
        "comment":    r.comment,
        "created_at": r.created_at.isoformat(),
        "is_mine":    (request.user.is_authenticated and r.user == request.user),
    } for r in reviews]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request, room_id):
    """Submit a review. Only allowed if user has booked this room."""
    room = get_object_or_404(Room, id=room_id)
    user = request.user

    # Check if this user has ever booked this room
    has_booking = Reservation.objects.filter(user=user, room=room).exists()
    if not has_booking:
        return Response(
            {"error": "You can only review rooms you have booked."},
            status=403
        )

    # Check if already reviewed
    if Review.objects.filter(user=user, room=room).exists():
        return Response(
            {"error": "You have already reviewed this room. Delete your existing review to write a new one."},
            status=400
        )

    rating  = request.data.get('rating')
    comment = request.data.get('comment', '').strip()
    title   = request.data.get('title', '').strip()

    if not rating or not comment:
        return Response({"error": "Rating and comment are required."}, status=400)
    if int(rating) not in range(1, 6):
        return Response({"error": "Rating must be between 1 and 5."}, status=400)

    review = Review.objects.create(
        user=user, room=room,
        rating=int(rating), title=title, comment=comment
    )

    return Response({
        "message": "Review submitted!",
        "id":       review.id,
        "rating":   review.rating,
        "username": user.username,
        "title":    review.title,
        "comment":  review.comment,
        "created_at": review.created_at.isoformat(),
    }, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):
    """Delete own review."""
    review = get_object_or_404(Review, id=review_id, user=request.user)
    review.delete()
    return Response({"message": "Review deleted."})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def can_review(request, room_id):
    """Check if the logged-in user can review this room."""
    room = get_object_or_404(Room, id=room_id)
    has_booking   = Reservation.objects.filter(user=request.user, room=room).exists()
    already_reviewed = Review.objects.filter(user=request.user, room=room).exists()
    return Response({
        "can_review":        has_booking and not already_reviewed,
        "has_booking":       has_booking,
        "already_reviewed":  already_reviewed,
    })


# ── Auth Endpoints ─────────────────────────────────────────────────────────────

@api_view(['POST'])
def register_user(request):
    d = request.data
    if User.objects.filter(username=d.get('username')).exists():
        return Response({"error": "Username already exists."}, status=400)
    User.objects.create_user(
        username=d.get('username'),
        email=d.get('email'),
        password=d.get('password')
    )
    return Response({"message": "User created successfully."})


@api_view(['POST'])
def login_user(request):
    user = authenticate(
        username=request.data.get('username'),
        password=request.data.get('password')
    )
    if user is None:
        return Response({"error": "Invalid credentials."}, status=401)
    refresh = RefreshToken.for_user(user)
    return Response({
        "access":   str(refresh.access_token),
        "refresh":  str(refresh),
        "is_staff": user.is_staff,   # 🔥 so frontend knows if user is admin
    })


# ── 🔥 AI Chatbot endpoint ────────────────────────────────────────────────────
HOTEL_SYSTEM_PROMPT = """You are Aria, the AI concierge for HotelAI — a luxury 5-star hotel in Sri Lanka. You are warm, elegant, and knowledgeable. You speak in a refined but friendly tone, like a seasoned concierge at a grand hotel.

You help guests with:
- Room information (types, pricing, amenities, availability)
- Booking guidance (how to reserve, check-in/out, cancellation)
- Hotel facilities (restaurant, spa, pool, gym)
- Local area tips (things to do in Sri Lanka, nearby attractions)
- General hotel policies (payment, pets, smoking)

Hotel details:
- Name: HotelAI Luxury Resort, Nuwara Eliya, Sri Lanka
- Rating: 5 stars, established 2024
- Rooms: 48 luxury rooms across 6 types
  • Superior Single Room: Rs. 11,000/night, 1 guest, 25m²
  • Deluxe Double Room: Rs. 18,000/night, 2 guests, 35m²
  • Ocean View Suite: Rs. 22,000/night, 2 guests, 45m², sea view
  • Family Room: Rs. 25,000/night, up to 4 guests
  • Penthouse Suite: Rs. 45,000/night, 2 guests, panoramic views
- Amenities: WiFi, AC, TV, pool, spa, gym, restaurant
- Restaurant hours: Breakfast 7–10:30, Lunch 12–14:30, Dinner 19–22:30
- Contact: +94 52 222 2881 | WhatsApp: +94 77 123 4567 | reservations@hotelai.lk
- Check-in: 2:00 PM | Check-out: 12:00 PM
- Payment: Stripe (card), PayHere, or Pay at Hotel
- Cancellation: Free cancellation with Pay at Hotel option
- Taxes: 10% added to all room rates

Keep responses concise (2-4 sentences). Never make up specific booking details. If someone wants to book, guide them to the Rooms page at /rooms."""


@api_view(['POST'])
def chat_with_aria(request):
    """
    Smart hotel chatbot — uses local rule-based engine.
    No external API needed. Reads real data from database.
    """
    from .chatbot_engine import generate_response

    messages = request.data.get('messages', [])
    if not messages:
        return Response({"error": "No messages provided."}, status=400)

    # Get the latest user message
    last_user_msg = ""
    for m in reversed(messages):
        if m.get('role') == 'user' and m.get('content', '').strip():
            last_user_msg = m['content'].strip()
            break

    if not last_user_msg:
        return Response({"error": "No user message found."}, status=400)

    # Pass the authenticated user if available (for personalised responses)
    user = request.user if request.user.is_authenticated else None

    try:
        reply = generate_response(last_user_msg, user=user)
        return Response({"reply": reply})
    except Exception as e:
        return Response({"reply": "I apologise, I'm having a brief moment. Please try again or call us at +94 52 222 2881."})