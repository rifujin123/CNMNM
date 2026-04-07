from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import Category, TourPackage, TravelTour, Comment, Hotel, Transport, Package
from .serializers import CategorySerializer, TourPackageDetailReadSerializer, TravelTourReadDetailSerializer, TravelTourWriteSerializer, CommentSerializer, HotelDetailReadSerializer, HotelWriteSerializer, PackageSerializer
from .perms import IsProvider, IsApprovedProvider, TourPackageOwner
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

class PackageViewSet(viewsets.ModelViewSet):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsApprovedProvider(),IsAdminUser()]

class TourPackageViewSet(viewsets.ModelViewSet):
    queryset = TourPackage.objects.all()
    serializer_class = TourPackageDetailReadSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [TourPackageOwner()]

    def perform_create(self, serializer):
        tour = serializer.validated_data.get('tour')
        if not tour:
            raise PermissionDenied("Thiếu tour để tạo TourPackage.")
        if self.request.user.is_staff:
            serializer.save()
            return
        if not getattr(self.request.user, 'is_provider', False):
            raise PermissionDenied("Chỉ provider hoặc admin mới được tạo TourPackage.")
        if tour.provider_id != self.request.user.id:
            raise PermissionDenied("Bạn chỉ được tạo TourPackage cho tour của bạn.")
        serializer.save()

class TravelTourViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
    queryset = TravelTour.objects.all()

    def get_serializer_class(self):
        if self.action in ['create','update','partial_update']:
            return TravelTourWriteSerializer
        return TravelTourReadDetailSerializer

class HotelViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
    queryset = Hotel.objects.all()

    def get_serializer_class(self):
        if self.action in ['create','update','partial_update']:
            return HotelWriteSerializer
        return HotelDetailReadSerializer
