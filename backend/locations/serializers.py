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
    country = serializers.CharField(source='country.name')
    class Meta:
        model = City
        fields = ['id','country','name']

class CityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['name','country']