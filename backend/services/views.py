from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.db.models import Q
from django.db.models import Count
from .models import Category, TourPackage, TravelTour, Comment, Hotel, Transport, Package, PromoBanner, Wishlist, SeatStatus
from .serializers import CategorySerializer, TourPackageDetailReadSerializer, TourPackageWriteSerializer, TravelTourReadDetailSerializer, TravelTourWriteSerializer, CommentSerializer, HotelDetailReadSerializer, HotelWriteSerializer, PackageSerializer, TransportWriteSerializer, TransportDetailReadSerializer, PromoBannerSerializer, WishlistSerializer
from .perms import (
    IsApprovedProviderOrAdmin,
    ServiceOwnerOrAdmin,
    TourPackageOwner,
)
from django.db.models import Count, Exists, OuterRef, Q
from django.utils import timezone


def is_admin_service_request(request):
    user = request.user
    return bool(
        user
        and user.is_authenticated
        and (user.is_staff or user.is_superuser)
        and request.query_params.get('admin') == 'true'
    )


def apply_active_filter(queryset, params):
    is_active = params.get('is_active')
    if is_active is not None:
        queryset = queryset.filter(is_active=is_active.lower() == 'true')
    return queryset


def apply_service_id_filter(queryset, params):
    service_id = params.get('service_id') or params.get('id')
    if service_id:
        if not str(service_id).isdigit():
            return queryset.none()
        queryset = queryset.filter(id=service_id)
    return queryset


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
        now = timezone.now()
        params = self.request.query_params
        show_all = is_admin_service_request(self.request)

        available_future_seats = SeatStatus.objects.filter(
            route__transport=OuterRef('pk'),
            route__departure_time__gte=now,
            status=SeatStatus.Status.AVAILABLE,
            booking__isnull=True,
        )

        if show_all:
            queryset = TravelTour.objects.all()
        else:
            queryset = TravelTour.objects.filter(
                is_active=True,
                time_start__gte=timezone.now(),
                empty_slot__gt=0,
            )

        queryset = queryset.annotate(
            popularity=Count('bookings', distinct=True)
        )

        if show_all:
            queryset = apply_active_filter(queryset, params)

        queryset = apply_service_id_filter(queryset, params)

        search_query = params.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(description__icontains=search_query)
                | Q(city__name__icontains=search_query)
                | Q(category__name__icontains=search_query)
            )

        city_id = params.get('city')
        if city_id:
            queryset = queryset.filter(city_id=city_id)

        category_id = params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        provider_id = params.get('provider')
        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)

        min_price = params.get('min_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)

        max_price = params.get('max_price')
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)

        min_star = params.get('min_star')
        if min_star:
            queryset = queryset.filter(star_rating__gte=min_star)

        max_star = params.get('max_star')
        if max_star:
            queryset = queryset.filter(star_rating__lte=max_star)

        min_empty_slot = params.get('min_empty_slot')
        if min_empty_slot:
            queryset = queryset.filter(empty_slot__gte=min_empty_slot)

        time_start_from = params.get('time_start_from')
        if time_start_from:
            queryset = queryset.filter(time_start__gte=time_start_from)

        time_start_to = params.get('time_start_to')
        if time_start_to:
            queryset = queryset.filter(time_start__lte=time_start_to)

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
        if ordering in allowed_ordering:
            queryset = queryset.order_by(allowed_ordering[ordering])
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def get_serializer_class(self):
        if self.action in ['create','update','partial_update']:
            return TravelTourWriteSerializer
        return TravelTourReadDetailSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'get_comments']:
            return [AllowAny()]
        if self.action in ['add_comment']:
            return [IsAuthenticated()]
        if self.action in ['create']:
            return [IsApprovedProviderOrAdmin()]
        return [ServiceOwnerOrAdmin()]
    
    @action(detail = True, methods = ['get'])
    def get_comments(self, request, pk = None):
        travel_tour = self.get_object()
        comments = travel_tour.comments.all()
        serializer = CommentSerializer(comments, many = True)
        return Response(serializer.data)

    @action(detail = True, methods = ['post'])
    def add_comment(self, request, pk = None):
        travel_tour = self.get_object()
        serializer = CommentSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(user = request.user, travel_tour = travel_tour)
            return Response(serializer.data, status = status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
        
    
class HotelViewSet(viewsets.ModelViewSet):
    queryset = Hotel.objects.annotate(popularity=Count('bookings'))

    def get_queryset(self):
        params = self.request.query_params
        show_all = is_admin_service_request(self.request)

        if show_all:
            queryset = Hotel.objects.all()
        else:
            queryset = Hotel.objects.filter(is_active=True)

        queryset = queryset.annotate(
            popularity=Count('bookings', distinct=True),
            available_room_count=Count(
                'rooms',
                filter=Q(rooms__is_available=True),
                distinct=True,
            ),
        )

        if show_all:
            queryset = apply_active_filter(queryset, params)
        else:
            queryset = queryset.filter(available_room_count__gt=0)

        queryset = apply_service_id_filter(queryset, params)

        category_id = params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        provider_id = params.get('provider')
        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)

        search_query = params.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(description__icontains=search_query)
                | Q(city__name__icontains=search_query)
                | Q(category__name__icontains=search_query)
            )

        allowed_ordering = {
            'newest': '-created_at',
            'oldest': 'created_at',
            'price_asc': 'base_price',
            'price_desc': '-base_price',
            'rating_asc': 'star_rating',
            'rating_desc': '-star_rating',
            'popularity_desc': '-popularity',
            'popularity_asc': 'popularity',
        }
        ordering = params.get('ordering')
        if ordering in allowed_ordering:
            queryset = queryset.order_by(allowed_ordering[ordering])
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def get_serializer_class(self):
        if self.action in ['create','update','partial_update']:
            return HotelWriteSerializer
        return HotelDetailReadSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action in ['create']:
            return [IsApprovedProviderOrAdmin()]
        return [ServiceOwnerOrAdmin()]

class TransportViewSet(viewsets.ModelViewSet):
    queryset = Transport.objects.annotate(popularity=Count('bookings'))

    def get_queryset(self):
        now = timezone.now()
        params = self.request.query_params
        show_all = is_admin_service_request(self.request)

        available_future_seats = SeatStatus.objects.filter(
            route__transport=OuterRef('pk'),
            route__departure_time__gte=now,
            status=SeatStatus.Status.AVAILABLE,
            booking__isnull=True,
        )

        if show_all:
            queryset = Transport.objects.all()
        else:
            queryset = Transport.objects.filter(is_active=True)

        queryset = queryset.annotate(
            popularity=Count('bookings', distinct=True),
            has_available_future_seat=Exists(available_future_seats),
        )

        if show_all:
            queryset = apply_active_filter(queryset, params)
        else:
            queryset = queryset.filter(has_available_future_seat=True)

        queryset = apply_service_id_filter(queryset, params)

        category_id = params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        provider_id = params.get('provider')
        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)

        search_query = params.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(description__icontains=search_query)
                | Q(city__name__icontains=search_query)
                | Q(category__name__icontains=search_query)
            )

        allowed_ordering = {
            'newest': '-created_at',
            'oldest': 'created_at',
            'price_asc': 'base_price',
            'price_desc': '-base_price',
            'rating_asc': 'star_rating',
            'rating_desc': '-star_rating',
            'popularity_desc': '-popularity',
            'popularity_asc': 'popularity',
        }
        ordering = params.get('ordering')
        if ordering in allowed_ordering:
            queryset = queryset.order_by(allowed_ordering[ordering])
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def get_serializer_class(self):
        if self.action in ['create','update','partial_update']:
            return TransportWriteSerializer
        return TransportDetailReadSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action in ['create']:
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
            'travel_tour',
            'travel_tour__city',
            'travel_tour__category',
        )

    def get_permissions(self):
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = serializer.validated_data.get('service')
        travel_tour = serializer.validated_data.get('travel_tour')

        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user,
            service=service,
            defaults={'travel_tour': travel_tour},
        )

        if travel_tour and wishlist.travel_tour_id is None:
            wishlist.travel_tour = travel_tour
            wishlist.save(update_fields=['travel_tour'])

        output = self.get_serializer(wishlist)
        return Response(
            output.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    @action(detail=False, methods=['delete'], url_path='remove')
    def remove_by_service_id(self, request):
        service_id = request.query_params.get('service_id') or request.query_params.get('tour_id')
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
