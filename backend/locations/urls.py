from django.urls import path
from . import views

urlpatterns = [
    path('countries/', views.CountryListView.as_view(), name='country-list'),
    path('countries/<int:pk>/', views.CountryDetailView.as_view(), name='country-detail'),
    path('cities/', views.CityListView.as_view(), name='city-list'),
    path('cities/<int:pk>/', views.CityDetailView.as_view(), name='city-detail'),
]