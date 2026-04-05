from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('seat-types', views.SeatTypeViewSet, basename='seat-type')

urlpatterns = [
    path('', include(router.urls)),
]