from rest_framework import serializers
from .models import Continent, Country, City

class ContinentReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Continent
        fields = ['id', 'name']

class ContinentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Continent
        fields = 'name'

class CountryReadSerializer(serializers.ModelSerializer):
    continent = ContinentReadSerializer()
    class Meta:
        model = Country
        fields = ['id','name','continent']

class CountryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['name','continent']

class CityReadSerializer(serializers.ModelSerializer):
    country = CountryReadSerializer()
    class Meta:
        model = City
        fields = ['id','name','country']

class CityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['name','country']