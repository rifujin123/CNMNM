from rest_framework import serializers
from .models import Country, City


class CountryReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name']


class CountryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['name']


class CityReadSerializer(serializers.ModelSerializer):
    country = CountryReadSerializer(read_only=True)

    class Meta:
        model = City
        fields = ['id', 'name', 'country', 'description', 'image', 'is_active']


class CityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['name', 'country', 'description', 'image', 'is_active']


class CityListSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)

    class Meta:
        model = City
        fields = ['id', 'name', 'country_name', 'description', 'image', 'is_active']