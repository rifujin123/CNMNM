from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.db.models import Count, Exists, OuterRef, Q
from .models import Category, TourPackage, TravelTour, Comment, Hotel, Transport, Package, PromoBanner, Wishlist, SeatStatus
from .serializers import CategorySerializer, TourPackageDetailReadSerializer, TourPackageWriteSerializer, TravelTourReadDetailSerializer, TravelTourWriteSerializer, CommentSerializer, HotelDetailReadSerializer, HotelWriteSerializer, PackageSerializer, TransportWriteSerializer, TransportDetailReadSerializer, PromoBannerSerializer, WishlistSerializer
from .perms import (
    IsApprovedProviderOrAdmin,
    ServiceOwnerOrAdmin,
    TourPackageOwner,
)
from django.utils import timezone


def get_service_category_or_raise(name):
    category = Category.objects.filter(name__iexact=name).first()
    if not category:
        raise PermissionDenied(f"Category '{name}' does not exist.")
    return category


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class PromoBannerViewSet(viewsets.ModelViewSet):
    queryset = PromoBanner.objects.all()
    serializer_class = PromoBannerSerializer

    def get_queryset(self):
        queryset = PromoBanner.objects.all()
        if self.action == 'list':
            is_active = self.request.query_params.get('is_active')
            if is_active is not None:
                queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset

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
        return [IsApprovedProviderOrAdmin()]

class TourPackageViewSet(viewsets.ModelViewSet):
    queryset = TourPackage.objects.all()
    serializer_class = TourPackageDetailReadSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TourPackageWriteSerializer
        return TourPackageDetailReadSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action in ['create']:
            return [IsApprovedProviderOrAdmin()]
        return [IsApprovedProviderOrAdmin(), TourPackageOwner()]

    def perform_create(self, serializer):
        tour = serializer.validated_data.get('tour')
        if not tour:
            raise PermissionDenied("Thiếu tour để tạo TourPackage.")
        if self.request.user.is_staff:
            serializer.save()
            return
        if not getattr(self.request.user, 'is_provider', False):
            raise PermissionDenied("Chỉ provider hoặc admin mới được tạo TourPackage.")
        if not getattr(self.request.user, 'is_approved', False):
            raise PermissionDenied("Provider chưa được duyệt không thể tạo TourPackage.")
        if tour.provider_id != self.request.user.id:
            raise PermissionDenied("Bạn chỉ được tạo TourPackage cho tour của bạn.")
        serializer.save()

class TravelTourViewSet(viewsets.ModelViewSet):
    queryset = TravelTour.objects.all()
    serializer_class = TravelTourReadDetailSerializer

    def get_queryset(self):
        params = self.request.query_params
        user = self.request.user
        now = timezone.now()

        queryset = TravelTour.objects.select_related(
            'city',
            'category',
            'provider',
        ).prefetch_related(
            'images',
            'tour_package',
        )

        admin_mode = user.is_authenticated and user.is_staff

        provider_mode = (
            params.get('mine') == 'true'
            and user.is_authenticated
            and getattr(user, 'is_provider', False)
        )

        if admin_mode:
            pass
        elif provider_mode:
            queryset = queryset.filter(provider=user)
        else:
            queryset = queryset.filter(
                is_active=True,
                time_start__gte=now,
                empty_slot__gt=0,
            )

        queryset = queryset.annotate(
            popularity=Count('bookings', distinct=True)
        )

        filters = {
            'city_id': params.get('city'),
            'category_id': params.get('category'),
            'provider_id': params.get('provider'),
            'base_price__gte': params.get('min_price'),
            'base_price__lte': params.get('max_price'),
            'star_rating__gte': params.get('min_star'),
            'star_rating__lte': params.get('max_star'),
            'empty_slot__gte': params.get('min_empty_slot'),
            'time_start__gte': params.get('time_start_from'),
            'time_start__lte': params.get('time_start_to'),
        }

        queryset = queryset.filter(**{
            key: value
            for key, value in filters.items()
            if value
        })

        q = params.get('q')
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q)
                | Q(description__icontains=q)
                | Q(city__name__icontains=q)
                | Q(category__name__icontains=q)
            )

        allowed_ordering = {
            'newest': '-created_at',
            'oldest': 'created_at',
            'price_asc': 'base_price',
            'price_desc': '-base_price',
            'rating_asc': 'star_rating',
            'rating_desc': '-star_rating',
            'start_soon': 'time_start',
            'start_late': '-time_start',
            'popularity_desc': '-popularity',
            'popularity_asc': 'popularity',
        }

        ordering = params.get('ordering')
        return queryset.order_by(
            allowed_ordering.get(ordering, '-created_at')
        )
    def get_serializer_class(self):
        if self.action in ['create','update','partial_update']:
            return TravelTourWriteSerializer
        return TravelTourReadDetailSerializer

    def perform_create(self, serializer):
        category = get_service_category_or_raise('Tour')
        serializer.save(provider=self.request.user, category=category)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action == 'comments' and self.request.method == 'GET':
            return [AllowAny()]
        if self.action == 'comments':
            return [IsAuthenticated()]
        if self.action in ['create']:
            return [IsApprovedProviderOrAdmin()]
        return [ServiceOwnerOrAdmin()]

    def _list_comments(self, request, pk=None):
        travel_tour = self.get_object()
        comments = travel_tour.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def _create_comment(self, request, pk=None):
        travel_tour = self.get_object()
        if travel_tour.comments.filter(user=request.user).exists():
            return Response(
                {'detail': 'You already reviewed this tour.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, travel_tour=travel_tour)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, pk=None):
        if request.method == 'GET':
            return self._list_comments(request, pk=pk)

        return self._create_comment(request, pk=pk)


class HotelViewSet(viewsets.ModelViewSet):
    queryset = Hotel.objects.all()

    def get_queryset(self):
        params = self.request.query_params
        user = self.request.user

        queryset = Hotel.objects.select_related(
            'city', 'category', 'provider'
        ).prefetch_related(
            'images', 'room_types', 'rooms'
        )

        admin_mode = user.is_authenticated and user.is_staff
        provider_mode = (
            params.get('mine') == 'true'
            and user.is_authenticated
            and getattr(user, 'is_provider', False)
        )

        queryset = queryset.annotate(
            popularity=Count('bookings', distinct=True),
            available_room_count=Count(
                'rooms',
                filter=Q(rooms__is_available=True),
                distinct=True,
            ),
        )

        if admin_mode:
            pass
        elif provider_mode:
            queryset = queryset.filter(provider=user)
        else:
            queryset = queryset.filter(is_active=True, available_room_count__gt=0)

        filters = {
            'id': params.get('service_id') or params.get('id'),
            'city_id': params.get('city'),
            'category_id': params.get('category'),
            'provider_id': params.get('provider'),
            'star_rating__gte': params.get('min_star'),
            'star_rating__lte': params.get('max_star'),
            'base_price__gte': params.get('min_price'),
            'base_price__lte': params.get('max_price'),
        }

        queryset = queryset.filter(**{k: v for k, v in filters.items() if v})

        q = params.get('q')
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) | Q(description__icontains=q) |
                Q(city__name__icontains=q) | Q(address_detail__icontains=q)
            )

        allowed_ordering = {
            'newest': '-created_at',
            'oldest': 'created_at',
            'price_asc': 'base_price',
            'price_desc': '-base_price',
            'rating_asc': 'star_rating',
            'rating_desc': '-star_rating',
            'popularity_desc': '-popularity',
        }
        ordering = params.get('ordering')
        return queryset.order_by(allowed_ordering.get(ordering, '-created_at'))

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return HotelWriteSerializer
        return HotelDetailReadSerializer

    def perform_create(self, serializer):
        category = get_service_category_or_raise('Hotel')
        serializer.save(provider=self.request.user, category=category)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action == 'create':
            return [IsApprovedProviderOrAdmin()]
        return [ServiceOwnerOrAdmin()]
    
class TransportViewSet(viewsets.ModelViewSet):
    queryset = Transport.objects.all()

    def get_queryset(self):
        params = self.request.query_params
        user = self.request.user
        now = timezone.now()

        queryset = Transport.objects.select_related(
            'city', 'category', 'provider'
        ).prefetch_related('images', 'routes')

        available_future_seats = SeatStatus.objects.filter(
            route__transport=OuterRef('pk'),
            route__departure_time__gte=now,
            status=SeatStatus.Status.AVAILABLE,
            booking__isnull=True,
        )

        admin_mode = user.is_authenticated and user.is_staff
        provider_mode = (
            params.get('mine') == 'true'
            and user.is_authenticated
            and getattr(user, 'is_provider', False)
        )

        queryset = queryset.annotate(
            popularity=Count('bookings', distinct=True),
            has_available_future_seat=Exists(available_future_seats),
        )

        if admin_mode:
            pass
        elif provider_mode:
            queryset = queryset.filter(provider=user)
        else:
            queryset = queryset.filter(is_active=True, has_available_future_seat=True)

        filters = {
            'id': params.get('service_id') or params.get('id'),
            'city_id': params.get('city'),
            'category_id': params.get('category'),
            'provider_id': params.get('provider'),
            'base_price__gte': params.get('min_price'),
            'base_price__lte': params.get('max_price'),
        }

        queryset = queryset.filter(**{k: v for k, v in filters.items() if v})

        q = params.get('q')
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) | Q(brand_name__icontains=q) |
                Q(license_plate__icontains=q) | Q(city__name__icontains=q)
            )

        ordering = params.get('ordering')
        allowed_ordering = {
            'newest': '-created_at',
            'price_asc': 'base_price',
            'price_desc': '-base_price',
            'popularity_desc': '-popularity',
        }
        return queryset.order_by(allowed_ordering.get(ordering, '-created_at'))

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TransportWriteSerializer
        return TransportDetailReadSerializer

    def perform_create(self, serializer):
        category = get_service_category_or_raise('Transport')
        serializer.save(provider=self.request.user, category=category)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action == 'create':
            return [IsApprovedProviderOrAdmin()]
        return [ServiceOwnerOrAdmin()]


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Wishlist.objects.none()
        return Wishlist.objects.filter(user=self.request.user).select_related(
            'service',
            'service__city',
            'service__category',
        )

    def get_permissions(self):
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = serializer.validated_data.get('service')

        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user,
            service=service,
        )

        output = self.get_serializer(wishlist)
        return Response(
            output.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    def _delete_by_service_id(self, request, service_id):
        if not service_id:
            return Response(
                {"detail": "service_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        wishlist = self.get_queryset().filter(service_id=service_id).first()
        if wishlist is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        wishlist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['delete'], url_path=r'(?P<service_id>[^/.]+)')
    def delete_by_service_id(self, request, service_id=None):
        return self._delete_by_service_id(request, service_id)

    @action(detail=False, methods=['delete'], url_path='remove')
    def remove_by_service_id(self, request):
        service_id = request.query_params.get('service_id') or request.query_params.get('tour_id')
        return self._delete_by_service_id(request, service_id)

