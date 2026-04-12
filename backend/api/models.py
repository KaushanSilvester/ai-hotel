from django.db import models
from django.contrib.auth.models import User


class Room(models.Model):
    ROOM_TYPES = (
        ('single', 'Single'),
        ('double', 'Double'),
        ('suite', 'Suite'),
    )

    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.IntegerField()
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.room_type


class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.room.room_type}"