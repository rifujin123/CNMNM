from rest_framework import viewsets
from .models import Category
from .serializers import CategorySerializer, RoomTypeSerializer
from .models import RoomType, SeatType

class RoomTypeViewSet(viewsets.ModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer