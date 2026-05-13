from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import BookingViewSet

router = SimpleRouter()
router.register(r'', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls))
]

