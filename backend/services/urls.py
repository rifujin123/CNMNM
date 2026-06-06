from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Concrete views: path-based
urlpatterns = [
    # Categories
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),

    # Packages
    path('packages/', views.PackageListCreateView.as_view(), name='package-list-create'),

    # Tour Packages
    path('tour-packages/', views.TourPackageListCreateView.as_view(), name='tour-package-list-create'),
    path('tour-packages/<int:pk>/', views.TourPackageDetailView.as_view(), name='tour-package-detail'),

    # Tours + comments (custom action)
    path('tours/', views.TourListCreateView.as_view(), name='tour-list-create'),
    path('tours/<int:pk>/', views.TourDetailView.as_view(), name='tour-detail'),

    # Hotels
    path('hotels/', views.HotelListCreateView.as_view(), name='hotel-list-create'),
    path('hotels/<int:pk>/', views.HotelDetailView.as_view(), name='hotel-detail'),

    # Transports
    path('transports/', views.TransportListCreateView.as_view(), name='transport-list-create'),
    path('transports/<int:pk>/', views.TransportDetailView.as_view(), name='transport-detail'),

    # Promo Banners
    path('promo-banners/', views.PromoBannerListCreateView.as_view(), name='promo-banner-list-create'),
    path('promo-banners/<int:pk>/', views.PromoBannerDetailView.as_view(), name='promo-banner-detail'),
]

# ViewSets with @action: router-based
router = DefaultRouter()
router.register(r'tours', views.TourCommentViewSet, basename='tour-comments')
router.register(r'wishlist', views.WishlistViewSet, basename='wishlist')

urlpatterns += [
    path('', include(router.urls)),
]