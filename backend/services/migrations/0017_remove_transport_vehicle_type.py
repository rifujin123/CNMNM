# Generated manually for removing Transport.vehicle_type

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0016_wishlist_service'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transport',
            name='vehicle_type',
        ),
    ]