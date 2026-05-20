from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
]
