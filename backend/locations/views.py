from django.shortcuts import render
from rest_framework import viewsets
from rest_framework import generics
from .models import Continent, Country, City
from .serializers import ContinentReadSerializer, CountryReadSerializer, CityReadSerializer
from rest_framework.response import Response
from rest_framework.decorators import action

# Create your views here.
class ContinentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Continent.objects.all()
    serializer_class = ContinentReadSerializer

    @action(detail = True, methods = ['get'])
    def countries(self, request, pk = None):
        continent = self.get_object()
        countries = continent.countries.all()
        serializer = CountryReadSerializer(countries, many = True)
        return Response(serializer.data)

class CountryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Country.objects.all()
    serializer_class = CountryReadSerializer

    @action(detail = True, methods = ['get'])
    def cities(self, request, pk = None):
        country = self.get_object()

        cities = country.cities.all()

        serializer = CityReadSerializer(cities, many = True)
        return Response(serializer.data)

class CityViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = City.objects.all()
    serializer_class = CityReadSerializer