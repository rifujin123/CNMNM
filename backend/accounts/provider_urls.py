from django.urls import path
from . import views

urlpatterns = [
    path('pending/', views.PendingProviderListView.as_view()),
    path('<int:provider_id>/verification/', views.ProviderVerificationView.as_view()),
]
