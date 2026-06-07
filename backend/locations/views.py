from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .models import Country, City
from .serializers import CountryReadSerializer, CityListSerializer


class CountryListView(ListAPIView):
    """UC13: List all countries."""
    queryset = Country.objects.order_by('name')
    serializer_class = CountryReadSerializer
    permission_classes = [AllowAny]


class CountryDetailView(RetrieveAPIView):
    """UC13: Get country with cities."""
    queryset = Country.objects.prefetch_related('cities')
    serializer_class = CountryReadSerializer
    permission_classes = [AllowAny]


class CityListView(ListAPIView):
    """UC13: List all cities."""
    queryset = City.objects.select_related('country').order_by('name')
    serializer_class = CityListSerializer
    permission_classes = [AllowAny]


class CityDetailView(RetrieveAPIView):
    """UC13: Get city detail."""
    queryset = City.objects.select_related('country')
    serializer_class = CityListSerializer
    permission_classes = [AllowAny]