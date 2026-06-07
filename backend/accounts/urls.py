from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AccountViewSet, ProviderAdminViewSet, UserAdminViewSet

router = DefaultRouter()
router.register(r'', AccountViewSet, basename='account')

provider_router = DefaultRouter()
provider_router.register(r'', ProviderAdminViewSet, basename='provider-admin')

admin_router = DefaultRouter()
admin_router.register(r'users', UserAdminViewSet, basename='user-admin')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(provider_router.urls)),
    path('admin/', include(admin_router.urls)),
]