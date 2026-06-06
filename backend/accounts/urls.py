from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AccountViewSet, ProviderAdminViewSet

router = DefaultRouter()
router.register(r'', AccountViewSet, basename='account')

provider_router = DefaultRouter()
provider_router.register(r'', ProviderAdminViewSet, basename='provider-admin')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(provider_router.urls)),
]