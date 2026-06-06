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
    country_id = serializers.IntegerField(source='country.id', read_only=True)

    class Meta:
        model = City
        fields = ['id', 'name', 'country', 'country_id', 'description', 'image', 'is_active']


class CityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['name', 'country', 'description', 'image', 'is_active']