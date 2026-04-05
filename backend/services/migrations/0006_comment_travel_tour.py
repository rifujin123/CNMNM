# Generated manually: migrate Comment from service (BaseService) to travel_tour (TravelTour)

import django.db.models.deletion
from django.db import migrations, models


def forwards_copy_service_to_tour(apps, schema_editor):
    Comment = apps.get_model('services', 'Comment')
    TravelTour = apps.get_model('services', 'TravelTour')

    for comment in Comment.objects.all():
        # Multi-table inheritance: TravelTour dùng cùng pk với bản ghi BaseService tương ứng
        if TravelTour.objects.filter(pk=comment.service_id).exists():
            comment.travel_tour_id = comment.service_id
            comment.save(update_fields=['travel_tour_id'])
        else:
            # Comment trước đó gắn hotel/transport — không map được sang tour
            comment.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0005_comment'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='travel_tour',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='comments',
                to='services.traveltour',
            ),
        ),
        migrations.RunPython(forwards_copy_service_to_tour, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='comment',
            name='service',
        ),
        migrations.AlterField(
            model_name='comment',
            name='travel_tour',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='comments',
                to='services.traveltour',
            ),
        ),
    ]
