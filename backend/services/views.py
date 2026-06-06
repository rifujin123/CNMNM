from django.db.models import Count, Exists, OuterRef, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .models import (
    Category, Package, TourPackage, TravelTour, Comment,
    Hotel, Transport, PromoBanner, Wishlist, SeatStatus, BaseService,
)
from .serializers import (
    CategoryReadSerializer, CategoryWriteSerializer,
    TourPackageReadSerializer, TourPackageWriteSerializer,
    TravelTourReadSerializer, TravelTourWriteSerializer,
    CommentReadSerializer, CommentWriteSerializer,
    HotelReadSerializer, HotelWriteSerializer,
    PackageReadSerializer, PackageWriteSerializer,
    TransportReadSerializer, TransportWriteSerializer,
    PromoBannerReadSerializer, PromoBannerWriteSerializer,
    WishlistReadSerializer, WishlistWriteSerializer,
)
from .perms import IsApprovedProviderOrAdmin, ServiceOwnerOrAdmin


def _get_category_or_404(name):
    category = Category.objects.filter(name__iexact=name).first()
    if not category:
        from rest_framework.exceptions import NotFound
        raise NotFound(f"Category '{name}' does not exist.")
    return category


# ==================== Mixin: partial update only ====================

class PartialUpdateMixin:
    """Force all updates to be partial (PATCH-only behavior)."""

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# ==================== Category (UC31) ====================

class CategoryListCreateView(ListCreateAPIView):
    queryset = Category.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        return CategoryReadSerializer if self.request.method == 'GET' else CategoryWriteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CategoryReadSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


class CategoryDetailView(PartialUpdateMixin, RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        return CategoryReadSerializer if self.request.method == 'GET' else CategoryWriteSerializer

    def retrieve(self, request, *args, **kwargs):
        return Response(CategoryReadSerializer(self.get_object()).data)


# ==================== Package ====================

class PackageListCreateView(ListCreateAPIView):
    queryset = Package.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsApprovedProviderOrAdmin()]

    def get_serializer_class(self):
        return PackageReadSerializer if self.request.method == 'GET' else PackageWriteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PackageReadSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


# ==================== Tour Package ====================

class TourPackageListCreateView(ListCreateAPIView):
    queryset = TourPackage.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsApprovedProviderOrAdmin()]

    def get_serializer_class(self):
        return TourPackageReadSerializer if self.request.method == 'GET' else TourPackageWriteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tour = serializer.validated_data.get('tour')
        if tour and not request.user.is_staff and tour.provider_id != request.user.id:
            return Response({'detail': 'You can only create packages for your own tours.'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save()
        return Response(TourPackageReadSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


class TourPackageDetailView(PartialUpdateMixin, RetrieveUpdateDestroyAPIView):
    queryset = TourPackage.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsApprovedProviderOrAdmin()]

    def get_serializer_class(self):
        return TourPackageReadSerializer if self.request.method == 'GET' else TourPackageWriteSerializer

    def retrieve(self, request, *args, **kwargs):
        return Response(TourPackageReadSerializer(self.get_object()).data)


# ==================== Travel Tour (UC06-UC08, UC13-UC16) ====================

class TourListCreateView(ListCreateAPIView):
    """UC13 Search, UC14 Sort, UC06 Post Tour."""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsApprovedProviderOrAdmin()]

    def get_serializer_class(self):
        return TravelTourReadSerializer if self.request.method == 'GET' else TravelTourWriteSerializer

    def get_queryset(self):
        params = self.request.query_params
        user = self.request.user
        now = timezone.now()
        qs = TravelTour.objects.select_related('city', 'category', 'provider').prefetch_related('images', 'tour_packages')

        admin_mode = user.is_authenticated and user.is_staff
        provider_mode = params.get('mine') == 'true' and user.is_authenticated and getattr(user, 'is_provider', False)

        if admin_mode:
            pass
        elif provider_mode:
            qs = qs.filter(provider=user)
        else:
            qs = qs.filter(is_active=True, time_start__gte=now, empty_slot__gt=0)

        qs = qs.annotate(popularity=Count('bookings', distinct=True))

        filters = {
            'city_id': params.get('city'), 'category_id': params.get('category'),
            'provider_id': params.get('provider'),
            'base_price__gte': params.get('min_price'), 'base_price__lte': params.get('max_price'),
            'star_rating__gte': params.get('min_star'), 'star_rating__lte': params.get('max_star'),
            'empty_slot__gte': params.get('min_empty_slot'),
            'time_start__gte': params.get('time_start_from'), 'time_start__lte': params.get('time_start_to'),
        }
        qs = qs.filter(**{k: v for k, v in filters.items() if v})

        q = params.get('q')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q) | Q(city__name__icontains=q) | Q(category__name__icontains=q))

        ordering_map = {
            'newest': '-created_at', 'oldest': 'created_at',
            'price_asc': 'base_price', 'price_desc': '-base_price',
            'rating_asc': 'star_rating', 'rating_desc': '-star_rating',
            'start_soon': 'time_start', 'start_late': '-time_start',
            'popularity_desc': '-popularity', 'popularity_asc': 'popularity',
        }
        return qs.order_by(ordering_map.get(params.get('ordering'), '-created_at'))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = _get_category_or_404('Tour')
        serializer.save(provider=request.user, category=category, service_type='tour')
        return Response(TravelTourReadSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


class TourDetailView(PartialUpdateMixin, RetrieveUpdateDestroyAPIView):
    """UC07 Edit, UC08 Delete, UC15 View Detail."""

    queryset = TravelTour.objects.select_related('city', 'category', 'provider').prefetch_related('images', 'tour_packages')

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return [ServiceOwnerOrAdmin()]

    def get_serializer_class(self):
        return TravelTourReadSerializer if self.request.method == 'GET' else TravelTourWriteSerializer

    def retrieve(self, request, *args, **kwargs):
        return Response(TravelTourReadSerializer(self.get_object()).data)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])


# UC10, UC20 - Custom logic: Comments
class TourCommentViewSet(GenericViewSet):
    queryset = TravelTour.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, pk=None):
        tour = self.get_object()
        if request.method == 'GET':
            return Response(CommentReadSerializer(tour.comments.all(), many=True).data)
        if tour.comments.filter(user=request.user).exists():
            return Response({'detail': 'You already reviewed this tour.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = CommentWriteSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, travel_tour=tour)
        return Response(CommentReadSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


# ==================== Hotel (UC06-UC08, UC13-UC16) ====================

class HotelListCreateView(ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsApprovedProviderOrAdmin()]

    def get_serializer_class(self):
        return HotelReadSerializer if self.request.method == 'GET' else HotelWriteSerializer

    def get_queryset(self):
        params = self.request.query_params
        user = self.request.user
        qs = Hotel.objects.select_related('city', 'category', 'provider').prefetch_related('images', 'room_types', 'rooms')

        admin_mode = user.is_authenticated and user.is_staff
        provider_mode = params.get('mine') == 'true' and user.is_authenticated and getattr(user, 'is_provider', False)

        qs = qs.annotate(
            popularity=Count('bookings', distinct=True),
            available_room_count=Count('rooms', filter=Q(rooms__is_available=True), distinct=True),
        )

        if admin_mode:
            pass
        elif provider_mode:
            qs = qs.filter(provider=user)
        else:
            qs = qs.filter(is_active=True, available_room_count__gt=0)

        filters = {
            'id': params.get('id'), 'city_id': params.get('city'),
            'category_id': params.get('category'), 'provider_id': params.get('provider'),
            'star_rating__gte': params.get('min_star'), 'star_rating__lte': params.get('max_star'),
            'base_price__gte': params.get('min_price'), 'base_price__lte': params.get('max_price'),
        }
        qs = qs.filter(**{k: v for k, v in filters.items() if v})

        q = params.get('q')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q) | Q(city__name__icontains=q) | Q(address_detail__icontains=q))

        ordering_map = {
            'newest': '-created_at', 'oldest': 'created_at',
            'price_asc': 'base_price', 'price_desc': '-base_price',
            'rating_asc': 'star_rating', 'rating_desc': '-star_rating',
            'popularity_desc': '-popularity',
        }
        return qs.order_by(ordering_map.get(params.get('ordering'), '-created_at'))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = _get_category_or_404('Hotel')
        serializer.save(provider=request.user, category=category, service_type='hotel')
        return Response(HotelReadSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


class HotelDetailView(PartialUpdateMixin, RetrieveUpdateDestroyAPIView):
    queryset = Hotel.objects.select_related('city', 'category', 'provider').prefetch_related('images', 'room_types', 'rooms')

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return [ServiceOwnerOrAdmin()]

    def get_serializer_class(self):
        return HotelReadSerializer if self.request.method == 'GET' else HotelWriteSerializer

    def retrieve(self, request, *args, **kwargs):
        return Response(HotelReadSerializer(self.get_object()).data)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])


# ==================== Transport (UC06-UC08, UC13-UC16) ====================

class TransportListCreateView(ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsApprovedProviderOrAdmin()]

    def get_serializer_class(self):
        return TransportReadSerializer if self.request.method == 'GET' else TransportWriteSerializer

    def get_queryset(self):
        params = self.request.query_params
        user = self.request.user
        now = timezone.now()
        qs = Transport.objects.select_related('city', 'category', 'provider').prefetch_related('images', 'routes')

        available_future_seats = SeatStatus.objects.filter(
            route__transport=OuterRef('pk'), route__departure_time__gte=now,
            status=SeatStatus.Status.AVAILABLE, booking__isnull=True,
        )

        admin_mode = user.is_authenticated and user.is_staff
        provider_mode = params.get('mine') == 'true' and user.is_authenticated and getattr(user, 'is_provider', False)

        qs = qs.annotate(
            popularity=Count('bookings', distinct=True),
            has_available_future_seat=Exists(available_future_seats),
        )

        if admin_mode:
            pass
        elif provider_mode:
            qs = qs.filter(provider=user)
        else:
            qs = qs.filter(is_active=True, has_available_future_seat=True)

        filters = {
            'id': params.get('id'), 'city_id': params.get('city'),
            'category_id': params.get('category'), 'provider_id': params.get('provider'),
            'base_price__gte': params.get('min_price'), 'base_price__lte': params.get('max_price'),
        }
        qs = qs.filter(**{k: v for k, v in filters.items() if v})

        q = params.get('q')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(brand_name__icontains=q) | Q(license_plate__icontains=q) | Q(city__name__icontains=q))

        ordering_map = {
            'newest': '-created_at', 'price_asc': 'base_price',
            'price_desc': '-base_price', 'popularity_desc': '-popularity',
        }
        return qs.order_by(ordering_map.get(params.get('ordering'), '-created_at'))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = _get_category_or_404('Transport')
        serializer.save(provider=request.user, category=category, service_type='transport')
        return Response(TransportReadSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


class TransportDetailView(PartialUpdateMixin, RetrieveUpdateDestroyAPIView):
    queryset = Transport.objects.select_related('city', 'category', 'provider').prefetch_related('images', 'routes')

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return [ServiceOwnerOrAdmin()]

    def get_serializer_class(self):
        return TransportReadSerializer if self.request.method == 'GET' else TransportWriteSerializer

    def retrieve(self, request, *args, **kwargs):
        return Response(TransportReadSerializer(self.get_object()).data)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])


# ==================== Wishlist (custom logic) ====================

class WishlistViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='')
    def index(self, request):
        wishlists = Wishlist.objects.filter(user=request.user).select_related('service', 'service__city', 'service__category')
        return Response(WishlistReadSerializer(wishlists, many=True).data)

    @action(detail=False, methods=['post'], url_path='')
    def add(self, request):
        serializer = WishlistWriteSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user, service_id=serializer.validated_data['service_id'],
        )
        return Response(WishlistReadSerializer(wishlist).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['delete'], url_path=r'(?P<service_id>[^/.]+)')
    def remove(self, request, service_id=None):
        wishlist = Wishlist.objects.filter(user=request.user, service_id=service_id).first()
        if not wishlist:
            return Response({'detail': 'Wishlist item not found.'}, status=status.HTTP_404_NOT_FOUND)
        wishlist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==================== Promo Banner ====================

class PromoBannerListCreateView(ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        return PromoBannerReadSerializer if self.request.method == 'GET' else PromoBannerWriteSerializer

    def get_queryset(self):
        qs = PromoBanner.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PromoBannerReadSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


class PromoBannerDetailView(PartialUpdateMixin, RetrieveUpdateAPIView):
    queryset = PromoBanner.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        return PromoBannerReadSerializer if self.request.method == 'GET' else PromoBannerWriteSerializer

    def retrieve(self, request, *args, **kwargs):
        return Response(PromoBannerReadSerializer(self.get_object()).data)