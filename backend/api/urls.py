from django.urls import path
from .views import (
    chat_with_aria,
    get_recommendations,
    get_admin_notifications, mark_notifications_read, clear_notifications, test_notification,
    get_rooms, get_room_detail,
    create_reservation, my_reservations, cancel_reservation,
    register_user, login_user,
    get_reviews, create_review, delete_review, can_review,
)

urlpatterns = [
    # Rooms
    path('rooms/',             get_rooms),
    path('rooms/<int:id>/',    get_room_detail),

    # Bookings
    path('book/',              create_reservation),
    path('my-bookings/',       my_reservations),
    path('cancel/<int:id>/',   cancel_reservation),

    # Auth
    path('register/',          register_user),
    path('login/',             login_user),

    # 🔥 Reviews
    path('rooms/<int:room_id>/reviews/',          get_reviews),
    path('rooms/<int:room_id>/reviews/create/',   create_review),
    path('rooms/<int:room_id>/reviews/can/',      can_review),
    path('reviews/<int:review_id>/delete/',       delete_review),

    # 🔥 AI Chatbot
    path('chat/',                                 chat_with_aria),

    # 🔥 Personalised Recommendations
    path('recommendations/',                      get_recommendations),

    # 🔥 Admin Notifications
    path('admin-notifications/',                  get_admin_notifications),
    path('admin-notifications/read/',             mark_notifications_read),
    path('admin-notifications/clear/',            clear_notifications),
    path('admin-notifications/test/',             test_notification),
]