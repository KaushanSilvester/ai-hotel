from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room


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