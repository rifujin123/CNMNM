from django.db import models


class Country(models.Model):
    """Country model for location hierarchy."""

    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class City(models.Model):
    """City model linked to country."""

    name = models.CharField(max_length=255)
    country = models.ForeignKey('Country', on_delete=models.CASCADE, related_name='cities')
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='cities/', blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['country', 'name'], name='uniq_city_per_country'),
        ]

    def __str__(self):
        return f"{self.name}, {self.country.name}"