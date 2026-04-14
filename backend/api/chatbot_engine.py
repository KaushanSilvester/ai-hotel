"""
HotelAI Smart Chatbot Engine
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
    ("greeting",        [r"\bhi\b", r"\bhello\b", r"\bhey\b", r"\bgood (morning|afternoon|evening|day)\b"]),
    ("bot_name",        [r"what.*your name", r"who are you", r"your name", r"what.*called", r"introduce yourself"]),
    ("bot_human",       [r"are you (a |an )?(human|person|real|robot|bot|ai)", r"are you real"]),
    ("bot_creator",     [r"who (made|built|created|developed) you", r"who.*creator", r"who.*behind"]),
    ("bot_feelings",    [r"how are you", r"how.*doing", r"are you (okay|ok|good|fine|well)", r"how.*feeling"]),
    ("hotel_name",      [r"what.*hotel.*name", r"hotel name", r"which hotel", r"what.*this place", r"name of.*hotel"]),
    ("hotel_about",     [r"tell me about.*hotel", r"about.*hotel", r"what is hotelai", r"describe.*hotel"]),
    ("hotel_history",   [r"history", r"when.*established", r"how old", r"founded", r"since when", r"heritage"]),
    ("hotel_stars",     [r"how many stars", r"star hotel", r"what.*star rating"]),
    ("rooms_available", [r"what rooms", r"available rooms", r"list.*rooms", r"show.*rooms", r"types of rooms", r"room types", r"what.*offer"]),
    ("room_price",      [r"price", r"cost", r"how much", r"rate", r"afford"]),
    ("room_capacity",   [r"how many (people|guests|persons)", r"capacity", r"accommodate"]),
    ("room_amenities",  [r"amenities", r"facilities", r"wifi", r"\bac\b", r"\btv\b", r"balcony", r"minibar", r"jacuzzi", r"sea view"]),
    ("suite_info",      [r"suite", r"ocean view", r"best room", r"luxury room", r"most expensive"]),
    ("budget_room",     [r"cheapest", r"budget", r"affordable", r"lowest price", r"cheap room"]),
    ("family_room",     [r"family room", r"room for family", r"room for.*kids", r"room for.*children"]),
    ("availability",    [r"availab", r"vacant", r"free.*room", r"room.*free"]),
    ("how_to_book",     [r"how.*book", r"how.*reserve", r"how.*make.*booking", r"steps.*book"]),
    ("my_booking",      [r"my booking", r"my reservation", r"view.*booking", r"check.*my"]),
    ("cancel_booking",  [r"cancel", r"cancellation", r"refund"]),
    ("payment",         [r"payment", r"\bpay\b", r"credit card", r"stripe", r"payhere", r"cash"]),
    ("checkin_checkout",[r"check.?in", r"check.?out", r"arrival", r"departure", r"time.*arrive"]),
    ("restaurant",      [r"restaurant", r"food", r"dining", r"eat", r"breakfast", r"lunch", r"dinner", r"meal"]),
    ("spa",             [r"spa", r"massage", r"wellness", r"relax", r"treatment"]),
    ("pool",            [r"pool", r"swim"]),
    ("gym",             [r"gym", r"fitness", r"workout", r"exercise"]),
    ("wifi",            [r"wifi", r"internet", r"wi-fi", r"wireless"]),
    ("parking",         [r"parking", r"car park"]),
    ("pets",            [r"pet", r"dog", r"cat", r"animal"]),
    ("smoking",         [r"smok", r"cigarette"]),
    ("children",        [r"child", r"kid", r"baby", r"infant"]),
    ("location",        [r"where.*hotel", r"location", r"address", r"directions", r"nuwara eliya"]),
    ("contact",         [r"contact", r"phone", r"call", r"email", r"whatsapp", r"reach"]),
    ("nearby",          [r"nearby", r"around here", r"attraction", r"places to visit", r"things to do", r"sightseeing"]),
    ("transport",       [r"transport", r"taxi", r"airport.*pickup", r"how to get", r"from colombo", r"from kandy"]),
    ("special_request", [r"special request", r"surprise", r"anniversary", r"honeymoon", r"birthday", r"romantic", r"proposal"]),
    ("events",          [r"event", r"wedding", r"conference", r"meeting", r"party", r"function", r"banquet"]),
    ("rating",          [r"rating", r"review", r"star", r"feedback", r"quality"]),
    ("weather",         [r"weather", r"temperature", r"climate", r"raining", r"cold", r"warm"]),
    ("recommend",       [r"recommend", r"suggest", r"best room", r"which room.*choose", r"what.*should i book"]),
    ("compliment",      [r"you are great", r"you are awesome", r"amazing", r"love this", r"well done", r"helpful"]),
    ("complaint",       [r"not good", r"bad service", r"disappoint", r"complain", r"worst"]),
    ("joke",            [r"tell.*joke", r"make me laugh", r"funny"]),
    ("language",        [r"speak.*sinhala", r"speak.*tamil", r"other language", r"do you speak"]),
    ("goodbye",         [r"\bbye\b", r"\bgoodbye\b", r"\bsee you\b", r"\bthanks\b", r"\bthank you\b", r"\bthank\b"]),
    ("help",            [r"\bhelp\b", r"what can you", r"what do you know", r"capabilities"]),
]


def detect_intent(text):
    text_lower = text.lower().strip()
    for intent, patterns in INTENTS:
        for pattern in patterns:
            if re.search(pattern, text_lower):
                return intent
    return "unknown"


def get_rooms_from_db():
    try:
        from .models import Room
        return list(Room.objects.all())
    except Exception:
        return []


def get_available_rooms():
    try:
        from .models import Room
        return list(Room.objects.filter(available=True))
    except Exception:
        return []


def get_user_bookings(user):
    try:
        from .models import Reservation
        return list(Reservation.objects.filter(user=user).select_related('room').order_by('-created_at'))
    except Exception:
        return []


def generate_response(user_message, user=None):
    intent = detect_intent(user_message)

    # GREETING
    if intent == "greeting":
        name = (", " + user.username) if user and user.is_authenticated else ""
        return ("Welcome to HotelAI" + name + "! I am Aria, your personal hotel concierge.\n\n"
                "I can help you with:\n"
                "- Room information and availability\n"
                "- Pricing and amenities\n"
                "- How to make a booking\n"
                "- Restaurant, spa, pool and facilities\n"
                "- Contact and location\n\n"
                "What would you like to know?")

    # BOT NAME
    if intent == "bot_name":
        return ("My name is Aria!\n\n"
                "I am the AI concierge for HotelAI Luxury Resort. "
                "I am here 24/7 to help you with everything from room bookings to hotel information.\n\n"
                "How may I assist you today?")

    # BOT HUMAN
    if intent == "bot_human":
        return ("I am Aria, HotelAI's virtual concierge — not a human, but designed to be just as helpful!\n\n"
                "I can answer questions about rooms, bookings, facilities, and more instantly.\n"
                "For complex requests, our human staff are available at +94 52 222 2881.")

    # BOT CREATOR
    if intent == "bot_creator":
        return ("I was built specifically for HotelAI Luxury Resort to assist guests around the clock.\n\n"
                "I have direct access to real-time room availability, pricing, and booking information "
                "so I can give you accurate answers instantly.\n\n"
                "Is there anything I can help you with?")

    # BOT FEELINGS
    if intent == "bot_feelings":
        return ("I am doing wonderfully, thank you for asking!\n\n"
                "Always happy when I can help guests have an amazing stay at HotelAI.\n\n"
                "How about you — what can I help you with today?")

    # HOTEL NAME
    if intent == "hotel_name":
        return ("We are HotelAI Luxury Resort!\n\n"
                "A 5-star luxury hotel nestled in the beautiful hill country of "
                "Nuwara Eliya, Sri Lanka — also known as the Little England of Sri Lanka.")

    # HOTEL ABOUT
    if intent == "hotel_about":
        rooms = get_rooms_from_db()
        count = len(rooms) if rooms else 48
        return ("HotelAI Luxury Resort is a 5-star hotel with " + str(count) + " beautifully appointed rooms.\n\n"
                "Set against the stunning backdrop of Nuwara Eliya's misty mountains, we offer:\n"
                "- Luxury rooms and suites\n"
                "- Fine dining restaurant\n"
                "- Spa and wellness centre\n"
                "- Swimming pool\n"
                "- Fully equipped gym\n"
                "- Free high-speed WiFi\n\n"
                "Our mission is to deliver timeless luxury with warm Sri Lankan hospitality.")

    # HOTEL HISTORY
    if intent == "hotel_history":
        return ("HotelAI Luxury Resort has a rich heritage dating back over 140 years.\n\n"
                "Originally built during the British colonial era, our hotel has been a landmark "
                "of elegance in Nuwara Eliya.\n\n"
                "We have welcomed royalty, dignitaries, and discerning travellers from around the world "
                "while preserving the timeless charm that makes us truly unique.")

    # HOTEL STARS
    if intent == "hotel_stars":
        return ("We are a proud 5-Star Luxury Resort!\n\n"
                "Our rating reflects our commitment to:\n"
                "- Exceptional room quality and amenities\n"
                "- World-class dining\n"
                "- Outstanding personalised service\n"
                "- Premium spa and wellness facilities\n"
                "- Stunning location in Nuwara Eliya")

    # ROOMS AVAILABLE
    if intent == "rooms_available":
        rooms = get_available_rooms()
        if not rooms:
            return "There are no rooms available at the moment. Please call +94 52 222 2881 for assistance."
        lines = []
        for r in rooms:
            lines.append("- " + r.room_type + ": Rs. " + str(int(float(r.price))) + "/night, up to " + str(r.capacity) + " guests")
        return ("We currently have " + str(len(rooms)) + " rooms available:\n\n" +
                "\n".join(lines) +
                "\n\nVisit our Rooms page to browse with photos and book directly!")

    # ROOM PRICE
    if intent == "room_price":
        rooms = get_rooms_from_db()
        if not rooms:
            return "Please contact us at +94 52 222 2881 for current pricing."
        lines = []
        for r in rooms:
            lines.append("- " + r.room_type + ": Rs. " + str(int(float(r.price))) + " per night")
        cheapest = min(rooms, key=lambda r: float(r.price))
        return ("Our room rates:\n\n" +
                "\n".join(lines) +
                "\n\nAll rates include 10% taxes. "
                "Most affordable option: " + cheapest.room_type + " at Rs. " + str(int(float(cheapest.price))) + "/night.")

    # ROOM CAPACITY
    if intent == "room_capacity":
        rooms = get_rooms_from_db()
        if not rooms:
            return "Please contact us at +94 52 222 2881 for room capacity information."
        lines = []
        for r in rooms:
            lines.append("- " + r.room_type + ": up to " + str(r.capacity) + " guests")
        return "Room capacities:\n\n" + "\n".join(lines)

    # ROOM AMENITIES
    if intent == "room_amenities":
        return ("All rooms include:\n"
                "- Free High-Speed WiFi\n"
                "- Air Conditioning\n"
                "- Smart TV\n"
                "- 24/7 Room Service\n"
                "- Daily Housekeeping\n\n"
                "Premium rooms also have balconies, sea views, jacuzzis, and mini bars.\n"
                "Ask me about a specific room type for full details!")

    # SUITE INFO
    if intent == "suite_info":
        rooms = get_rooms_from_db()
        if rooms:
            best = max(rooms, key=lambda r: float(r.price))
            return ("Our finest room is the " + best.room_type + "!\n\n"
                    "Price: Rs. " + str(int(float(best.price))) + " per night\n"
                    "Guests: up to " + str(best.capacity) + "\n\n"
                    "Features panoramic views, premium furnishings, and exclusive amenities.\n"
                    "Visit the Rooms page to book it!")
        return "Our Ocean View Suite is our finest room with panoramic views and full luxury amenities."

    # BUDGET ROOM
    if intent == "budget_room":
        rooms = get_rooms_from_db()
        if rooms:
            cheapest = min(rooms, key=lambda r: float(r.price))
            return ("Most affordable option: " + cheapest.room_type + "\n\n"
                    "Price: Rs. " + str(int(float(cheapest.price))) + " per night\n"
                    "Guests: up to " + str(cheapest.capacity) + "\n\n"
                    "Still includes free WiFi, AC, TV, and 24/7 service. Great value for a 5-star experience!")
        return "Our Superior Single Room is our most affordable option. Visit the Rooms page for pricing!"

    # FAMILY ROOM
    if intent == "family_room":
        rooms = get_rooms_from_db()
        family = [r for r in rooms if r.capacity >= 3] if rooms else []
        if family:
            lines = ["- " + r.room_type + ": Rs. " + str(int(float(r.price))) + "/night, up to " + str(r.capacity) + " guests" for r in family]
            return ("Rooms perfect for families:\n\n" +
                    "\n".join(lines) +
                    "\n\nChildren under 5 stay FREE! Cots available on request.")
        return "We have family rooms for groups of 3 or more. Visit our Rooms page for details!"

    # AVAILABILITY
    if intent == "availability":
        rooms = get_available_rooms()
        count = len(rooms) if rooms else 0
        if count == 0:
            return ("Unfortunately we are fully booked at the moment.\n\n"
                    "Contact us for future availability:\n"
                    "Phone: +94 52 222 2881\n"
                    "Email: reservations@hotelai.lk")
        return ("Great news — we have " + str(count) + " rooms available right now!\n\n"
                "Visit our Rooms page to browse options and book directly.")

    # HOW TO BOOK
    if intent == "how_to_book":
        return ("Booking is easy! Here are the steps:\n\n"
                "1. Go to the Rooms page\n"
                "2. Browse rooms and click Reserve Room\n"
                "3. Select your check-in and check-out dates\n"
                "4. Choose number of guests\n"
                "5. Click Proceed to Payment\n"
                "6. Choose Pay Now or Pay at Hotel\n"
                "7. Receive your email confirmation instantly!\n\n"
                "Free cancellation with Pay at Hotel option.")

    # MY BOOKING
    if intent == "my_booking":
        if not user or not user.is_authenticated:
            return "Please sign in to your account to view your bookings. Go to My Bookings in the menu."
        bookings = get_user_bookings(user)
        if not bookings:
            return ("Hi " + user.username + "! You have no bookings yet.\n\n"
                    "Visit the Rooms page to browse and book your perfect stay!")
        lines = []
        for b in bookings[:3]:
            nights = (b.check_out - b.check_in).days
            lines.append("- " + b.room.room_type + ": " + str(b.check_in) + " to " + str(b.check_out) +
                         " (" + str(nights) + " night" + ("s" if nights > 1 else "") + ")" +
                         " | " + b.payment_status.replace("_", " ").title())
        return ("Hi " + user.username + "! Your latest bookings:\n\n" +
                "\n".join(lines) +
                "\n\nVisit My Bookings to manage all your reservations.")

    # CANCEL
    if intent == "cancel_booking":
        return ("To cancel a booking:\n\n"
                "1. Go to My Bookings in your dashboard\n"
                "2. Find the reservation you want to cancel\n"
                "3. Click the Cancel button\n\n"
                "Free cancellation is available for Pay at Hotel bookings.\n"
                "For paid bookings: +94 52 222 2881 or reservations@hotelai.lk")

    # PAYMENT
    if intent == "payment":
        return ("We accept:\n\n"
                "- Stripe (Visa, Mastercard, Amex)\n"
                "- PayHere (Sri Lanka cards and wallets)\n"
                "- Pay at Hotel (cash or card on arrival)\n\n"
                "Pay at Hotel offers free cancellation! All prices include 10% taxes.")

    # CHECK IN/OUT
    if intent == "checkin_checkout":
        return ("Check-in: 2:00 PM\n"
                "Check-out: 12:00 PM (noon)\n\n"
                "Early check-in or late check-out may be available on request.\n"
                "Call +94 52 222 2881 to arrange.")

    # RESTAURANT
    if intent == "restaurant":
        return ("HotelAI Restaurant serves Sri Lankan and international cuisine:\n\n"
                "Breakfast: 7:00 AM - 10:30 AM\n"
                "Lunch: 12:00 PM - 2:30 PM\n"
                "Dinner: 7:00 PM - 10:30 PM\n\n"
                "24/7 Room Service also available.\n"
                "Some rooms include breakfast in the rate!")

    # SPA
    if intent == "spa":
        return ("Spa and Wellness Centre:\n\n"
                "- Full body massages\n"
                "- Ayurvedic treatments\n"
                "- Facial treatments\n"
                "- Steam and sauna\n\n"
                "Open daily: 9:00 AM - 8:00 PM\n"
                "Advance booking recommended. Call +94 52 222 2881.")

    # POOL
    if intent == "pool":
        return ("Swimming Pool:\n\n"
                "Beautiful outdoor pool available to all guests.\n"
                "Hours: 7:00 AM - 9:00 PM\n"
                "Towels provided. Poolside bar service available.\n"
                "Enjoy scenic hill country views!")

    # GYM
    if intent == "gym":
        return ("Fitness Centre:\n\n"
                "- Cardio machines (treadmills, bikes)\n"
                "- Free weights and resistance machines\n"
                "- Yoga mats\n\n"
                "Open daily: 6:00 AM - 10:00 PM\n"
                "Free for all hotel guests!")

    # WIFI
    if intent == "wifi":
        return ("Free WiFi is available throughout the hotel — in all rooms, "
                "the lobby, restaurant, and pool area.\n\n"
                "High-speed fibre connection. Connect to HotelAI-Guest network!")

    # PARKING
    if intent == "parking":
        return ("Free parking available for all guests:\n\n"
                "- Outdoor car park (free)\n"
                "- 24/7 security\n"
                "- Valet service on request")

    # PETS
    if intent == "pets":
        return ("Yes, we are pet-friendly!\n\n"
                "Pets are welcome in our designated pet-friendly rooms.\n"
                "Please inform us when booking. Contact: +94 52 222 2881")

    # SMOKING
    if intent == "smoking":
        return ("Smoking is permitted only in designated smoking rooms and outdoor areas.\n\n"
                "Please request a smoking room when booking.")

    # CHILDREN
    if intent == "children":
        return ("Children are very welcome at HotelAI!\n\n"
                "- Children under 5 stay FREE\n"
                "- Family rooms available for up to 4 guests\n"
                "- Cots available on request\n"
                "- Kids menu in the restaurant")

    # LOCATION
    if intent == "location":
        return ("HotelAI Luxury Resort\n"
                "Grand Hotel Road, Nuwara Eliya, Sri Lanka\n\n"
                "Located in the scenic hill country — the 'Little England' of Sri Lanka.\n\n"
                "From Colombo: ~5 hours by car\n"
                "By train: Nanu Oya station (5 mins away)\n\n"
                "Need directions? Call +94 52 222 2881")

    # CONTACT
    if intent == "contact":
        return ("Contact us:\n\n"
                "Phone: +94 52 222 2881\n"
                "WhatsApp: +94 77 123 4567\n"
                "Email: reservations@hotelai.lk\n"
                "Address: Grand Hotel Road, Nuwara Eliya, Sri Lanka\n\n"
                "Reception is open 24 hours, 7 days a week.")

    # NEARBY
    if intent == "nearby":
        return ("Things to do near HotelAI in Nuwara Eliya:\n\n"
                "- Victoria Park (botanical gardens)\n"
                "- Tea Factory Tours\n"
                "- Horton Plains National Park\n"
                "- Gregory Lake (boat rides)\n"
                "- World's End (cliff views)\n"
                "- Hakgala Botanical Gardens\n"
                "- Nuwara Eliya Town Market\n\n"
                "Our concierge can arrange tours and transport. Call +94 52 222 2881!")

    # TRANSPORT
    if intent == "transport":
        return ("Getting to HotelAI:\n\n"
                "From Colombo Airport: ~5.5 hours by car\n"
                "From Colombo City: ~5 hours\n"
                "By train: Alight at Nanu Oya Station (5 mins)\n"
                "By bus: Nuwara Eliya Bus Stand (10 mins)\n\n"
                "We can arrange a private airport pickup!\n"
                "WhatsApp: +94 77 123 4567")

    # SPECIAL REQUEST
    if intent == "special_request":
        return ("We love making stays extra special!\n\n"
                "We can arrange:\n"
                "- Flower decoration for romantic occasions\n"
                "- Birthday cakes and surprises\n"
                "- Honeymoon packages with champagne\n"
                "- Proposal setups\n"
                "- Candlelit private dinners\n"
                "- Anniversary celebrations\n\n"
                "Contact us in advance:\n"
                "Phone: +94 52 222 2881\n"
                "Email: reservations@hotelai.lk")

    # EVENTS
    if intent == "events":
        return ("Events and Functions at HotelAI:\n\n"
                "- Weddings and receptions\n"
                "- Conferences and business meetings\n"
                "- Birthday and anniversary parties\n"
                "- Private dining and banquets\n"
                "- Corporate retreats\n\n"
                "Contact our events team:\n"
                "Phone: +94 52 222 2881\n"
                "Email: reservations@hotelai.lk")

    # RATING
    if intent == "rating":
        rooms = get_rooms_from_db()
        if rooms:
            avg = sum(float(r.rating) for r in rooms) / len(rooms)
            total = sum(r.total_reviews for r in rooms)
            return ("HotelAI Luxury Resort is rated " + str(round(avg, 1)) + "/5 "
                    "based on " + str(total) + " guest reviews.\n\n"
                    "We pride ourselves on exceptional luxury experiences!")
        return "We are a 5-star luxury resort with excellent guest reviews!"

    # WEATHER
    if intent == "weather":
        return ("Nuwara Eliya Weather:\n\n"
                "Cool and misty climate year-round.\n"
                "Average temperature: 5 to 20 degrees Celsius\n"
                "Rainy season: May to August\n"
                "Best time to visit: December to March\n\n"
                "We recommend bringing a light jacket for evenings!\n"
                "Our rooms have heating for your comfort.")

    # RECOMMEND
    if intent == "recommend":
        rooms = get_rooms_from_db()
        if rooms:
            pick = random.choice(rooms)
            return ("My recommendation: " + pick.room_type + "!\n\n"
                    "Price: Rs. " + str(int(float(pick.price))) + " per night\n"
                    "Guests: up to " + str(pick.capacity) + "\n\n"
                    "Excellent value and all the luxury of a 5-star resort.\n"
                    "Check it out on the Rooms page!")
        return "I recommend our Ocean View Suite for the ultimate luxury, or our Deluxe Double for great value!"

    # COMPLIMENT
    if intent == "compliment":
        return ("Thank you so much! That really means a lot to us!\n\n"
                "We work hard to provide the best experience for every guest.\n"
                "We would love to welcome you to HotelAI soon!")

    # COMPLAINT
    if intent == "complaint":
        return ("I am truly sorry to hear that. Your experience matters deeply to us.\n\n"
                "Please share your concerns with our management team:\n"
                "Phone: +94 52 222 2881\n"
                "Email: reservations@hotelai.lk\n\n"
                "We take all feedback seriously and will make things right.")

    # JOKE
    if intent == "joke":
        jokes = [
            "Why did the hotel guest bring a ladder? Because they heard the drinks were on the house!",
            "What did the ocean say to the Ocean View Suite? Nothing — it just waved!",
            "Why do hotels make great comedians? Because they always have great delivery!",
            "What do you call a hotel room that tells jokes? A suite comedian!",
        ]
        return random.choice(jokes) + "\n\nHope that made you smile! Is there anything else I can help with?"

    # LANGUAGE
    if intent == "language":
        return ("I currently communicate in English only.\n\n"
                "However, our hotel staff speaks Sinhala, Tamil, and English.\n\n"
                "For assistance in your language: +94 52 222 2881")

    # GOODBYE
    if intent == "goodbye":
        name = (", " + user.username) if user and user.is_authenticated else ""
        return ("Thank you for chatting with us" + name + "!\n\n"
                "We hope to welcome you to HotelAI Luxury Resort soon.\n"
                "Have a wonderful day!")

    # HELP
    if intent == "help":
        return ("I can help you with:\n\n"
                "- Rooms: availability, prices, amenities\n"
                "- Booking: how to book, my bookings, cancellation\n"
                "- Payment: accepted methods, policies\n"
                "- Location: address, directions\n"
                "- Contact: phone, WhatsApp, email\n"
                "- Dining: restaurant hours\n"
                "- Spa, Pool, Gym\n"
                "- Nearby attractions\n"
                "- Special requests and events\n"
                "- Policies: pets, smoking, children\n\n"
                "Just ask me anything! If you prefer to speak with a person: +94 52 222 2881")

    # UNKNOWN
    return ("I am not sure I understood that.\n\n"
            "Here is what I can help with:\n"
            "- Type 'rooms' to see available rooms\n"
            "- Type 'prices' for room rates\n"
            "- Type 'book' to learn how to reserve\n"
            "- Type 'contact' for our phone and email\n"
            "- Type 'help' for all options\n\n"
            "Or call us: +94 52 222 2881")