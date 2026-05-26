from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProviderStatsViewSet


router = DefaultRouter()
router.register(r"stats", ProviderStatsViewSet, basename="provider-stats")


urlpatterns = [
    path("", include(router.urls)),
]
