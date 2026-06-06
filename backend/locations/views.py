from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action

from .models import Country, City
from .serializers import CountryReadSerializer, CityReadSerializer


class CountryViewSet(GenericViewSet):
    """UC13: Browse countries."""

    queryset = Country.objects.order_by('name')
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='')
    def index(self, request):
        return Response(CountryReadSerializer(self.get_queryset(), many=True).data)

    @action(detail=True, methods=['get'], url_path='cities')
    def cities(self, request, pk=None):
        country = self.get_object()
        cities = country.cities.order_by('name')
        return Response(CityReadSerializer(cities, many=True).data)


class CityViewSet(GenericViewSet):
    """UC13: Browse cities."""

    queryset = City.objects.order_by('name')
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='')
    def index(self, request):
        return Response(CityReadSerializer(self.get_queryset(), many=True).data)