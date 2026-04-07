from django.db import models


# Create your models here.
class Continent(models.Model):
    name = models.CharField(max_length=255)
    def __str__(self):
        return self.name

class Country(models.Model):
    name = models.CharField(max_length=255)
    continent = models.ForeignKey('Continent', on_delete=models.CASCADE, related_name='countries')
    def __str__(self):
        return self.name
    
class City(models.Model):
    name = models.CharField(max_length=255)
    country = models.ForeignKey('Country', on_delete = models.CASCADE, related_name = 'cities')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['country', 'name'], name='uniq_city_per_country'),
        ]

    def __str__(self):
        return f"{self.name}, {self.country.name}"