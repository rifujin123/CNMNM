from rest_framework import viewsets
from .models import Country, City
from .serializers import CountryReadSerializer, CityReadSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountryReadSerializer
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'])
    def cities(self, request, pk=None):
        country = self.get_object()
        cities = country.cities.all()
        serializer = CityReadSerializer(cities, many=True)
        return Response(serializer.data)

class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = City.objects.all()
    serializer_class = CityReadSerializer
    permission_classes = [AllowAny]
