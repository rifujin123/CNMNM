from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('countries', views.CountryViewSet, basename='country')
router.register('cities', views.CityViewSet, basename='city')
urlpatterns = [
    path('', include(router.urls)),
]