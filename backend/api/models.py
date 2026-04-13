from django.db import models
from django.contrib.auth.models import User


class Room(models.Model):
    ROOM_TYPES = (
        ('single','Single'),('double','Double'),('suite','Suite'),
        ('deluxe','Deluxe'),('family','Family'),('penthouse','Penthouse'),
    )
    BED_TYPES = (
        ('single','Single Bed'),('double','Double Bed'),('queen','Queen Bed'),
        ('king','King Bed'),('twin','Twin Beds'),('bunk','Bunk Beds'),
    )
    room_number = models.CharField(max_length=10, unique=True, null=True, blank=True)
    room_type   = models.CharField(max_length=20, choices=ROOM_TYPES)
    description = models.TextField(null=True, blank=True)
    floor       = models.IntegerField(null=True, blank=True)
    size_sqm    = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)
    bed_type    = models.CharField(max_length=20, choices=BED_TYPES, null=True, blank=True)
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    capacity    = models.IntegerField()
    available   = models.BooleanField(default=True)
    image  = models.ImageField(upload_to='rooms/', null=True, blank=True)
    image2 = models.ImageField(upload_to='rooms/', null=True, blank=True)
    image3 = models.ImageField(upload_to='rooms/', null=True, blank=True)
    image4 = models.ImageField(upload_to='rooms/', null=True, blank=True)
    wifi    = models.BooleanField(default=False)
    ac      = models.BooleanField(default=False)
    tv      = models.BooleanField(default=False)
    balcony            = models.BooleanField(default=False)
    minibar            = models.BooleanField(default=False)
    safe               = models.BooleanField(default=False)
    bathtub            = models.BooleanField(default=False)
    jacuzzi            = models.BooleanField(default=False)
    sea_view           = models.BooleanField(default=False)
    breakfast_included = models.BooleanField(default=False)
    pet_friendly       = models.BooleanField(default=False)
    smoking_allowed    = models.BooleanField(default=False)
    rating        = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    total_reviews = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.room_type} - Room {self.room_number or self.id}"


class Reservation(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('stripe',       'Stripe (Card)'),
        ('payhere',      'PayHere'),
        ('pay_at_hotel', 'Pay at Hotel'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('paid',         'Paid'),
        ('pay_at_hotel', 'Pay at Hotel'),
        ('pending',      'Pending'),
        ('failed',       'Failed'),
    )

    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    room       = models.ForeignKey(Room, on_delete=models.CASCADE)
    check_in   = models.DateField()
    check_out  = models.DateField()
    guests     = models.IntegerField(default=1)
    special_requests = models.TextField(null=True, blank=True)

    # 🔥 Payment fields
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='pay_at_hotel')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pay_at_hotel')
    amount_paid    = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.room.room_type} ({self.payment_status})"