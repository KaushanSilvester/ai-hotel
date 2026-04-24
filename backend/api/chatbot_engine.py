"""
HotelAI Smart Chatbot Engine — Silvester
No external API needed. Reads real data from database.
"""
import re
import random

HOTEL_INFO = {
    "name":     "HotelAI Luxury Resort",
    "location": "Nuwara Eliya, Sri Lanka",
    "phone":    "+94 52 222 2881",
    "whatsapp": "+94 77 123 4567",
    "email":    "reservations@hotelai.lk",
    "checkin":  "2:00 PM",
    "checkout": "12:00 PM",
}

INTENTS = [
    ("greeting",         [r"\bhi\b", r"\bhello\b", r"\bhey\b", r"\bgood (morning|afternoon|evening|day)\b", r"\bwassup\b", r"\bgreetings\b", r"\bsup\b"]),
    ("bot_name",         [r"what.*your name", r"who are you", r"your name", r"what.*called", r"introduce yourself"]),
    ("bot_human",        [r"are you (a |an )?(human|person|real|robot|bot|ai)", r"are you real"]),
    ("bot_creator",      [r"who (made|built|created|developed) you", r"who.*creator", r"who.*behind"]),
    ("bot_feelings",     [r"how are you", r"how.*doing", r"are you (okay|ok|good|fine|well)", r"how.*feeling"]),
    ("hotel_name",       [r"what.*hotel.*name", r"hotel name", r"which hotel", r"what.*this place", r"name of.*hotel"]),
    ("hotel_about",      [r"tell me about.*hotel", r"about.*hotel", r"what is hotelai", r"describe.*hotel"]),
    ("hotel_history",    [r"history", r"when.*established", r"how old", r"founded", r"since when", r"heritage"]),
    ("hotel_stars",      [r"how many stars", r"star hotel", r"what.*star rating"]),

    # 🔥 Smart capacity matching - catches all variations
    ("rooms_by_capacity", [
        r"\d+\s*(member|person|people|guest|adult|pax|persons|members|adults|guests)",
        r"room for \d+",
        r"need.*\d+.*room",
        r"room.*\d+.*(people|person|member|guest|adult)",
        r"\d+.*(need|want|looking).*room",
        r"(we are|there are|for|party of|group of) \d+",
        r"accommodate \d+",
        r"(fit|sleep|hold|house) \d+",
        r"for (one|two|three|four|five|six|seven|eight) (person|people|guest|member|adult)",
        r"(one|two|three|four|five|six) (person|people|guest|member|adult)",
        r"\bjust me\b", r"\bjust myself\b", r"\bsolo travell",
        r"\bcouple\b", r"\btwo of us\b", r"\bjust the two\b",
        r"\bfamily of \d+",
        r"we are (a |)(couple|family|group|team|party)",
        r"i (am|m) alone", r"travelling alone", r"by myself",
    ]),

    ("show_rooms",       [r"show.*room", r"see.*room", r"view.*room", r"list.*room", r"display.*room", r"can you show", r"show me", r"let me see.*room"]),
    ("rooms_available",  [r"what rooms", r"available rooms", r"list.*rooms", r"types of rooms", r"room types", r"what.*offer", r"all rooms"]),
    ("room_price",       [r"price", r"cost", r"how much", r"rate", r"afford", r"expensive", r"tariff", r"charge"]),
    ("room_capacity",    [r"how many (people|guests|persons|members)", r"capacity", r"accommodate", r"maximum.*guests"]),
    ("room_amenities",   [r"amenities", r"facilities", r"wifi", r"\bac\b", r"\btv\b", r"balcony", r"minibar", r"jacuzzi", r"sea view", r"features", r"included"]),
    ("suite_info",       [r"suite", r"ocean view", r"best room", r"luxury room", r"most expensive", r"premium", r"finest"]),
    ("budget_room",      [r"cheapest", r"budget", r"affordable", r"lowest price", r"cheap room", r"low cost", r"economical"]),
    ("family_room",      [r"family room", r"room for family", r"room for.*kids", r"room for.*children", r"kid.*friendly"]),
    ("availability",     [r"availab", r"vacant", r"free.*room", r"room.*free", r"empty room"]),
    ("how_to_book",      [r"how.*book", r"how.*reserve", r"how.*make.*booking", r"steps.*book", r"want to book", r"i want.*room", r"can i book", r"make.*reservation"]),
    ("my_booking",       [r"my booking", r"my reservation", r"view.*booking", r"check.*my", r"my reservations"]),
    ("cancel_booking",   [r"cancel", r"cancellation", r"refund"]),
    ("payment",          [r"payment", r"\bpay\b", r"credit card", r"stripe", r"payhere", r"cash", r"how.*pay"]),
    ("checkin_checkout", [r"check.?in", r"check.?out", r"arrival", r"departure", r"time.*arrive", r"when.*check"]),
    ("restaurant",       [r"restaurant", r"food", r"dining", r"eat", r"breakfast", r"lunch", r"dinner", r"meal", r"menu"]),
    ("spa",              [r"spa", r"massage", r"wellness", r"relax", r"treatment"]),
    ("pool",             [r"pool", r"swim"]),
    ("gym",              [r"gym", r"fitness", r"workout", r"exercise"]),
    ("wifi",             [r"wifi", r"internet", r"wi-fi", r"wireless", r"connection"]),
    ("parking",          [r"parking", r"car park", r"vehicle"]),
    ("pets",             [r"pet", r"dog", r"cat", r"animal"]),
    ("smoking",          [r"smok", r"cigarette"]),
    ("children",         [r"child", r"kid", r"baby", r"infant"]),
    ("location",         [r"where.*hotel", r"location", r"address", r"directions", r"nuwara eliya", r"where are you"]),
    ("contact",          [r"contact", r"phone", r"call", r"email", r"whatsapp", r"reach", r"get in touch", r"speak.*someone", r"talk.*human"]),
    ("nearby",           [r"nearby", r"around here", r"attraction", r"places to visit", r"things to do", r"sightseeing", r"tourist"]),
    ("transport",        [r"transport", r"taxi", r"airport.*pickup", r"how to get", r"from colombo", r"from kandy", r"bus", r"train"]),
    ("special_request",  [r"special request", r"surprise", r"anniversary", r"honeymoon", r"birthday", r"romantic", r"proposal", r"decor"]),
    ("events",           [r"event", r"wedding", r"conference", r"meeting", r"party", r"function", r"banquet", r"reception"]),
    ("rating",           [r"rating", r"review", r"star", r"feedback", r"quality", r"how good"]),
    ("weather",          [r"weather", r"temperature", r"climate", r"raining", r"cold", r"warm"]),
    ("recommend",        [r"recommend", r"suggest", r"best room", r"which room.*choose", r"what.*should i book", r"advice"]),
    ("compliment",       [r"you are great", r"you are awesome", r"amazing", r"love this", r"well done", r"helpful", r"good job"]),
    ("complaint",        [r"not good", r"bad service", r"disappoint", r"complain", r"worst"]),
    ("joke",             [r"tell.*joke", r"make me laugh", r"funny"]),
    ("language",         [r"speak.*sinhala", r"speak.*tamil", r"other language", r"do you speak"]),
    ("goodbye",          [r"\bbye\b", r"\bgoodbye\b", r"\bsee you\b", r"\bthanks\b", r"\bthank you\b", r"\bthank\b", r"take care"]),
    ("help",             [r"\bhelp\b", r"what can you", r"what do you know", r"capabilities", r"commands", r"options"]),
]


def detect_intent(text):
    text_lower = text.lower().strip()
    for intent, patterns in INTENTS:
        for pattern in patterns:
            if re.search(pattern, text_lower):
                return intent
    return "unknown"


def extract_number(text):
    """Extract guest count — handles digits and word numbers."""
    word_map = {
        r"\bjust me\b": 1, r"\bmyself\b": 1, r"\bone person\b": 1, r"\balone\b": 1, r"\bsolo\b": 1,
        r"\btwo\b": 2, r"\b2 of us\b": 2, r"\bcouple\b": 2, r"\bpair\b": 2,
        r"\bthree\b": 3, r"\bfour\b": 4, r"\bfive\b": 5,
        r"\bsix\b": 6, r"\bseven\b": 7, r"\beight\b": 8,
    }
    text_lower = text.lower()
    for pattern, num in word_map.items():
        if re.search(pattern, text_lower):
            return num
    nums = re.findall(r"\d+", text)
    for n in nums:
        val = int(n)
        if 1 <= val <= 20:
            return val
    return None


def get_rooms_from_db():
    try:
        from .models import Room
        return list(Room.objects.all())
    except Exception:
        return []


def get_rooms_for_capacity(needed):
    try:
        from .models import Room
        exact  = list(Room.objects.filter(capacity=needed, available=True).order_by("price"))
        higher = list(Room.objects.filter(capacity__gt=needed, available=True).order_by("capacity", "price"))
        return exact, higher
    except Exception:
        return [], []


def get_available_rooms():
    try:
        from .models import Room
        return list(Room.objects.filter(available=True))
    except Exception:
        return []


def get_user_bookings(user):
    try:
        from .models import Reservation
        return list(Reservation.objects.filter(user=user).select_related("room").order_by("-created_at"))
    except Exception:
        return []


def format_room_card(room):
    amenities = []
    if getattr(room, "wifi", False):     amenities.append("WiFi")
    if getattr(room, "ac", False):       amenities.append("AC")
    if getattr(room, "sea_view", False): amenities.append("Sea View")
    if getattr(room, "balcony", False):  amenities.append("Balcony")
    if getattr(room, "jacuzzi", False):  amenities.append("Jacuzzi")
    if getattr(room, "breakfast_included", False): amenities.append("Breakfast")
    if getattr(room, "minibar", False):  amenities.append("Minibar")
    amenity_str = " . ".join(amenities[:4]) if amenities else "Standard amenities"
    return (
        "- " + room.room_type + "\n"
        "   Rs. " + str(int(float(room.price))) + "/night | "
        "Up to " + str(room.capacity) + " guest" + ("s" if room.capacity > 1 else "") + "\n"
        "   " + amenity_str
    )


def generate_response(user_message, user=None):
    intent = detect_intent(user_message)

    # GREETING
    if intent == "greeting":
        name = (", " + user.username) if user and user.is_authenticated else ""
        return ("Welcome to HotelAI" + name + "! I am Silvester, your personal hotel concierge.\n\n"
                "I can help you with:\n"
                "- Finding rooms for any number of guests\n"
                "- Pricing and amenities\n"
                "- Bookings and reservations\n"
                "- Dining, spa, and facilities\n"
                "- Location and contact\n\n"
                "Try asking: 'I need a room for 4 people'")

    # ROOMS BY CAPACITY
    if intent in ("rooms_by_capacity",):
        needed = extract_number(user_message)

        if not needed:
            return ("How many guests will be staying? Just tell me the number!\n\n"
                    "Examples:\n"
                    "- 'Room for 2 people'\n"
                    "- 'We are 4 members'\n"
                    "- 'I need a room for 3 guests'\n"
                    "- 'Just me' (for 1 person)")

        exact, higher = get_rooms_for_capacity(needed)

        if not exact and not higher:
            all_rooms = get_rooms_from_db()
            max_cap = max((r.capacity for r in all_rooms), default=4) if all_rooms else 4
            return ("Sorry, we do not have rooms for " + str(needed) + " guests right now.\n\n"
                    "Our largest rooms accommodate up to " + str(max_cap) + " guests.\n\n"
                    "For larger groups, contact us:\n"
                    "Phone: +94 52 222 2881\n"
                    "WhatsApp: +94 77 123 4567")

        response = "Here are rooms for " + str(needed) + " guest" + ("s" if needed > 1 else "") + ":\n\n"

        if exact:
            response += "Perfect fit:\n"
            for r in exact[:3]:
                response += format_room_card(r) + "\n\n"

        if higher:
            if exact:
                response += "Larger options also available:\n"
            else:
                response += "We have rooms with higher capacity:\n"
            for r in higher[:2]:
                response += format_room_card(r) + "\n\n"

        response += "To book, visit our Rooms page or call +94 52 222 2881!"
        return response

    # SHOW ROOMS
    if intent == "show_rooms":
        needed = extract_number(user_message)
        if needed:
            exact, higher = get_rooms_for_capacity(needed)
            if exact or higher:
                response = "Rooms for " + str(needed) + " guest" + ("s" if needed > 1 else "") + ":\n\n"
                for r in (exact + higher)[:4]:
                    response += format_room_card(r) + "\n\n"
                return response + "Visit Rooms page to book!"
        rooms = get_available_rooms()
        if not rooms:
            return "No rooms available right now. Call: +94 52 222 2881"
        response = "Here are our available rooms:\n\n"
        for r in rooms[:5]:
            response += format_room_card(r) + "\n\n"
        return response + "Tell me how many guests and I will narrow it down!"

    # BOT NAME
    if intent == "bot_name":
        return ("My name is Silvester!\n\n"
                "I am the AI concierge for HotelAI Luxury Resort, here 24/7 to help you.")

    if intent == "bot_human":
        return ("I am Silvester, HotelAI's virtual concierge — not a human, but just as helpful!\n\n"
                "Need a real person? Call: +94 52 222 2881")

    if intent == "bot_creator":
        return ("I was built for HotelAI Luxury Resort to assist guests around the clock.\n\n"
                "How can I help you today?")

    if intent == "bot_feelings":
        return ("I am doing wonderfully, thank you!\n\n"
                "Always happy to help guests at HotelAI. What can I do for you?")

    if intent == "hotel_name":
        return "We are HotelAI Luxury Resort — a 5-star luxury hotel in Nuwara Eliya, Sri Lanka!"

    if intent == "hotel_about":
        rooms = get_rooms_from_db()
        count = len(rooms) if rooms else 48
        return ("HotelAI Luxury Resort — " + str(count) + " luxury rooms in Nuwara Eliya.\n\n"
                "We offer: Fine dining, Spa, Pool, Gym, Free WiFi\n\n"
                "Timeless luxury with warm Sri Lankan hospitality.")

    if intent == "hotel_history":
        return ("HotelAI Luxury Resort has a 140+ year heritage.\n\n"
                "Originally built in the British colonial era, we blend historic charm with modern luxury.")

    if intent == "hotel_stars":
        return "We are a proud 5-Star Luxury Resort with exceptional service and facilities!"

    # ROOMS AVAILABLE
    if intent == "rooms_available":
        rooms = get_available_rooms()
        if not rooms:
            return "No rooms available right now. Call +94 52 222 2881"
        response = "We have " + str(len(rooms)) + " rooms available:\n\n"
        for r in rooms[:6]:
            response += format_room_card(r) + "\n\n"
        return response + "Tell me how many guests and I will find the best match!"

    # ROOM PRICE
    if intent == "room_price":
        rooms = get_rooms_from_db()
        if not rooms:
            return "Call +94 52 222 2881 for pricing."
        lines = []
        for r in sorted(rooms, key=lambda x: float(x.price)):
            lines.append("- " + r.room_type + ": Rs. " + str(int(float(r.price))) + "/night | " + str(r.capacity) + " guests")
        cheapest = min(rooms, key=lambda r: float(r.price))
        return ("Room rates:\n\n" + "\n".join(lines) +
                "\n\nAll prices include 10% taxes.\n"
                "Best value: " + cheapest.room_type + " from Rs. " + str(int(float(cheapest.price))) + "/night!")

    # ROOM CAPACITY
    if intent == "room_capacity":
        needed = extract_number(user_message)
        if needed:
            exact, higher = get_rooms_for_capacity(needed)
            if exact or higher:
                response = "Rooms for " + str(needed) + " guest" + ("s" if needed > 1 else "") + ":\n\n"
                for r in (exact + higher)[:4]:
                    response += format_room_card(r) + "\n\n"
                return response + "Visit Rooms page to book!"
        rooms = get_rooms_from_db()
        if not rooms:
            return "Call +94 52 222 2881 for capacity info."
        lines = ["- " + r.room_type + ": up to " + str(r.capacity) + " guests" for r in rooms]
        return "Room capacities:\n\n" + "\n".join(lines) + "\n\nTell me how many guests!"

    if intent == "room_amenities":
        return ("All rooms include:\n"
                "- Free WiFi, AC, Smart TV\n"
                "- 24/7 Room Service\n"
                "- Daily Housekeeping\n\n"
                "Premium rooms: balconies, sea views, jacuzzis, mini bars.\n"
                "Ask about a specific room type!")

    if intent == "suite_info":
        rooms = get_rooms_from_db()
        if rooms:
            best = max(rooms, key=lambda r: float(r.price))
            return "Our finest room:\n\n" + format_room_card(best) + "\n\nVisit Rooms page to book!"
        return "Our Ocean View Suite is our finest room with panoramic views!"

    if intent == "budget_room":
        rooms = get_rooms_from_db()
        if rooms:
            cheapest = min(rooms, key=lambda r: float(r.price))
            return "Most affordable option:\n\n" + format_room_card(cheapest) + "\n\nGreat value for 5-star luxury!"
        return "Our Superior Single Room is our most affordable option."

    if intent == "family_room":
        rooms = get_rooms_from_db()
        family = [r for r in rooms if r.capacity >= 3] if rooms else []
        if family:
            response = "Family-friendly rooms:\n\n"
            for r in family[:3]:
                response += format_room_card(r) + "\n\n"
            return response + "Children under 5 stay FREE!"
        return "We have family rooms for 3+ guests. Visit our Rooms page!"

    if intent == "availability":
        rooms = get_available_rooms()
        count = len(rooms) if rooms else 0
        if count == 0:
            return "Fully booked right now.\n\nCall +94 52 222 2881 for cancellations."
        return ("We have " + str(count) + " rooms available!\n\n"
                "Tell me how many guests and I will find the best options!")

    if intent == "how_to_book":
        return ("Booking steps:\n\n"
                "1. Go to the Rooms page\n"
                "2. Click Reserve Room\n"
                "3. Select your dates\n"
                "4. Choose number of guests\n"
                "5. Choose Pay Now or Pay at Hotel\n"
                "6. Get email confirmation!\n\n"
                "Free cancellation with Pay at Hotel.\n"
                "Or call: +94 52 222 2881")

    if intent == "my_booking":
        if not user or not user.is_authenticated:
            return "Please sign in to view your bookings."
        bookings = get_user_bookings(user)
        if not bookings:
            return "Hi " + user.username + "! No bookings yet. Visit Rooms page to book!"
        lines = []
        for b in bookings[:3]:
            nights = (b.check_out - b.check_in).days
            lines.append("- " + b.room.room_type + ": " + str(b.check_in) + " to " + str(b.check_out) +
                         " (" + str(nights) + " night" + ("s" if nights > 1 else "") + ")")
        return "Hi " + user.username + "! Your bookings:\n\n" + "\n".join(lines) + "\n\nVisit My Bookings to manage them."

    if intent == "cancel_booking":
        return ("To cancel:\n\n"
                "1. Go to My Bookings\n"
                "2. Find the reservation\n"
                "3. Click Cancel\n\n"
                "Free cancellation for Pay at Hotel bookings.\n"
                "For paid: +94 52 222 2881")

    if intent == "payment":
        return ("Payment methods:\n\n"
                "- Stripe (Visa, Mastercard, Amex)\n"
                "- PayHere (Sri Lanka cards)\n"
                "- Pay at Hotel (free cancellation!)\n\n"
                "All prices include 10% taxes.")

    if intent == "checkin_checkout":
        return "Check-in: 2:00 PM\nCheck-out: 12:00 PM\n\nEarly/late available on request. Call +94 52 222 2881"

    if intent == "restaurant":
        return ("Restaurant hours:\n\n"
                "Breakfast: 7:00 AM - 10:30 AM\n"
                "Lunch: 12:00 PM - 2:30 PM\n"
                "Dinner: 7:00 PM - 10:30 PM\n\n"
                "24/7 Room Service available!")

    if intent == "spa":
        return "Spa open daily 9:00 AM - 8:00 PM\nMassages, facials, ayurvedic treatments.\nCall +94 52 222 2881 to book."

    if intent == "pool":
        return "Swimming pool open 7:00 AM - 9:00 PM\nTowels provided. Poolside bar available!"

    if intent == "gym":
        return "Fitness Centre open 6:00 AM - 10:00 PM\nCardio, weights, yoga mats. Free for all guests!"

    if intent == "wifi":
        return "Free high-speed WiFi everywhere!\nNetwork: HotelAI-Guest — no password needed!"

    if intent == "parking":
        return "Free parking for all guests.\n24/7 security. Valet available on request."

    if intent == "pets":
        return "Yes, pet-friendly rooms available!\nPlease inform us when booking.\nCall +94 52 222 2881"

    if intent == "smoking":
        return "Smoking in designated areas only.\nRequest a smoking room when booking."

    if intent == "children":
        return "Children very welcome!\n- Under 5 stay FREE\n- Cots on request\n- Kids menu available"

    if intent == "location":
        return ("HotelAI Luxury Resort\n"
                "Grand Hotel Road, Nuwara Eliya, Sri Lanka\n\n"
                "From Colombo: ~5 hours by car\n"
                "By train: Nanu Oya station (5 mins)\n\n"
                "Call +94 52 222 2881 for directions.")

    if intent == "contact":
        return ("Contact us:\n\n"
                "Phone: +94 52 222 2881\n"
                "WhatsApp: +94 77 123 4567\n"
                "Email: reservations@hotelai.lk\n\n"
                "Reception open 24/7.")

    if intent == "nearby":
        return ("Nearby attractions:\n\n"
                "- Victoria Park\n"
                "- Tea Factory Tours\n"
                "- Horton Plains National Park\n"
                "- Gregory Lake\n"
                "- World's End cliff views\n\n"
                "We can arrange tours! Call +94 52 222 2881")

    if intent == "transport":
        return ("Getting here:\n\n"
                "From Colombo: ~5 hours by car\n"
                "By train: Nanu Oya Station (5 mins)\n"
                "By bus: Nuwara Eliya Bus Stand (10 mins)\n\n"
                "Private pickup available!\n"
                "WhatsApp: +94 77 123 4567")

    if intent == "special_request":
        return ("Special arrangements available:\n\n"
                "- Flower decoration\n"
                "- Birthday cakes\n"
                "- Honeymoon packages\n"
                "- Proposal setups\n"
                "- Candlelit dinners\n\n"
                "Contact us in advance:\n"
                "+94 52 222 2881")

    if intent == "events":
        return ("We host:\n\n"
                "- Weddings and receptions\n"
                "- Conferences\n"
                "- Birthday parties\n"
                "- Corporate retreats\n\n"
                "Contact: +94 52 222 2881")

    if intent == "rating":
        rooms = get_rooms_from_db()
        if rooms:
            ratings = [float(r.rating) for r in rooms if r.rating]
            avg = sum(ratings) / len(ratings) if ratings else 4.5
            return "HotelAI: " + str(round(avg, 1)) + "/5 stars\n\nWe pride ourselves on exceptional luxury!"
        return "We are a 5-star luxury resort with excellent reviews!"

    if intent == "weather":
        return ("Nuwara Eliya: cool and misty year-round.\n\n"
                "Temperature: 5-20 degrees C\n"
                "Best time: December - March\n\n"
                "Bring a light jacket! Rooms have heating.")

    if intent == "recommend":
        rooms = get_rooms_from_db()
        if rooms:
            pick = random.choice(rooms)
            return "My recommendation:\n\n" + format_room_card(pick) + "\n\nCheck it out on the Rooms page!"
        return "I recommend our Ocean View Suite for ultimate luxury!"

    if intent == "compliment":
        return "Thank you so much! That means a lot to us!\n\nWe hope to welcome you to HotelAI soon!"

    if intent == "complaint":
        return ("I am sorry to hear that.\n\n"
                "Please contact our management:\n"
                "Phone: +94 52 222 2881\n"
                "Email: reservations@hotelai.lk")

    if intent == "joke":
        jokes = [
            "Why did the hotel guest bring a ladder? Because they heard the drinks were on the house!",
            "What did the ocean say to the Ocean View Suite? Nothing — it just waved!",
            "Why do hotels make great comedians? Because they always have great delivery!",
        ]
        return random.choice(jokes) + "\n\nHope that made you smile!"

    if intent == "language":
        return "I communicate in English.\nOur staff speaks Sinhala, Tamil, and English.\nCall +94 52 222 2881 for assistance."

    if intent == "goodbye":
        name = (", " + user.username) if user and user.is_authenticated else ""
        return "Thank you for chatting" + name + "!\nWe hope to welcome you to HotelAI soon. Have a wonderful day!"

    if intent == "help":
        return ("Here is what I can do:\n\n"
                "- 'Room for 4 people' — find matching rooms\n"
                "- 'Show me rooms' — see all rooms\n"
                "- 'Cheapest room' — budget options\n"
                "- 'How to book' — booking guide\n"
                "- 'Restaurant hours' — dining info\n"
                "- 'Contact details' — phone and email\n"
                "- 'Where are you?' — location\n\n"
                "Just ask anything!")

    # UNKNOWN — helpful fallback
    return ("I want to help! Try asking:\n\n"
            "- 'I need a room for 4 people'\n"
            "- 'Show me available rooms'\n"
            "- 'What is the cheapest room?'\n"
            "- 'How do I make a booking?'\n"
            "- 'Restaurant hours'\n"
            "- 'Contact details'\n\n"
            "Or call us: +94 52 222 2881")