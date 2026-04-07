from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'tour-packages', views.TourPackageViewSet, basename='tour-package')
router.register(r'travel-tours', views.TravelTourViewSet, basename='travel-tour')
urlpatterns = [
    path('', include(router.urls)),
]