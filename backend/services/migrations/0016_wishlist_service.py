# Generated manually for generic service wishlist support.

import django.db.models.deletion
from django.db import migrations, models


def copy_tour_to_service(apps, schema_editor):
    Wishlist = apps.get_model('services', 'Wishlist')
    for wishlist in Wishlist.objects.filter(service_id__isnull=True):
        wishlist.service_id = wishlist.travel_tour_id
        wishlist.save(update_fields=['service'])


def copy_service_to_tour(apps, schema_editor):
    Wishlist = apps.get_model('services', 'Wishlist')
    TravelTour = apps.get_model('services', 'TravelTour')
    tour_ids = set(TravelTour.objects.values_list('id', flat=True))

    for wishlist in Wishlist.objects.filter(travel_tour_id__isnull=True):
        if wishlist.service_id in tour_ids:
            wishlist.travel_tour_id = wishlist.service_id
            wishlist.save(update_fields=['travel_tour'])


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0015_remove_flight_transport_ptr_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='wishlist',
            name='service',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='saved_by', to='services.baseservice'),
        ),
        migrations.RunPython(copy_tour_to_service, copy_service_to_tour),
        migrations.AlterField(
            model_name='wishlist',
            name='service',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_by', to='services.baseservice'),
        ),
        migrations.AlterField(
            model_name='wishlist',
            name='travel_tour',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='wishlisted_by', to='services.traveltour'),
        ),
        migrations.AlterUniqueTogether(
            name='wishlist',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='wishlist',
            constraint=models.UniqueConstraint(fields=('user', 'service'), name='uniq_wishlist_user_service'),
        ),
    ]
