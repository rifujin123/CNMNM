from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Concrete views
urlpatterns = [
    path('', views.PaymentListCreateView.as_view(), name='payment-list-create'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('admin-dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
]

# ViewSet with custom actions (cancel, confirm)
router = DefaultRouter()
router.register(r'', views.PaymentActionViewSet, basename='payment-actions')

urlpatterns += [
    path('', include(router.urls)),
]