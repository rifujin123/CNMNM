from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'stats', views.ProviderStatsViewSet, basename='provider-stats')
router.register(r'chats', views.ChatViewSet, basename='provider-chat')

urlpatterns = [
    path('', include(router.urls)),
]