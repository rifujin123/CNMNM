from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import Category, RoomType, SeatType, Package, TourPackage
from .serializers import CategorySerializer, RoomTypeSerializer, SeatTypeSerializer, PackageSerializer, TourPackageSerializer


class RoomTypeViewSet(viewsets.ModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SeatTypeViewSet(viewsets.ModelViewSet):
    serializer_class = SeatTypeSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SeatType.objects.filter(provider=self.request.user)

    def perform_create(self, serializer):
        if not self.request.user.is_provider:
            raise PermissionDenied('Chỉ tài khoản nhà cung cấp được tạo loại ghế.')
        serializer.save(provider=self.request.user)

class PackageViewSet(viewsets.ModelViewSet):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer


class TourPackageViewSet(viewsets.ModelViewSet):
    queryset = TourPackage.objects.all()
    serializer_class = TourPackageSerializer