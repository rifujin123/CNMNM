from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Concrete views
urlpatterns = [
    path('', views.BookingListCreateView.as_view(), name='booking-list-create'),
    path('<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
]

# ViewSet with custom actions (cancel, complete, refund, review)
router = DefaultRouter()
router.register(r'', views.BookingActionViewSet, basename='booking-actions')

urlpatterns += [
    path('', include(router.urls)),
]