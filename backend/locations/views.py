from django.shortcuts import render
from rest_framework import viewsets
from rest_framework import generics
from .models import Continent, Country, City
from .serializers import ContinentReadSerializer, CountryReadSerializer, CityReadSerializer

# Create your views here.
class ContinentViewSet(viewsets.ModelViewSet, generics.ListAPIView):
    queryset = Continent.objects.all()
    serializer_class = ContinentReadSerializer

class CountryViewSet(viewsets.ModelViewSet, generics.ListAPIView):
    queryset = Country.objects.all()
    serializer_class = CountryReadSerializer

class CityViewSet(viewsets.ModelViewSet, generics.ListAPIView):
    queryset = City.objects.all()
    serializer_class = CityReadSerializer