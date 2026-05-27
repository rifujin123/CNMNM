from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProviderAdminViewSet


router = DefaultRouter()
router.register(r'', ProviderAdminViewSet, basename='provider-admin')


urlpatterns = [
    path('', include(router.urls)),
]
