# Generated manually for Comment.rating

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0017_remove_transport_vehicle_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='rating',
            field=models.PositiveSmallIntegerField(
                default=5,
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(5),
                ],
            ),
        ),
    ]