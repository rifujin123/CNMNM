# SeatType thuộc từng nhà cung cấp (provider)

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def forwards_assign_seattype_provider(apps, schema_editor):
    SeatType = apps.get_model('services', 'SeatType')
    app_label, model_name = settings.AUTH_USER_MODEL.split('.', 1)
    User = apps.get_model(app_label, model_name)

    if not SeatType.objects.exists():
        return

    user = (
        User.objects.filter(is_provider=True).order_by('pk').first()
        or User.objects.order_by('pk').first()
    )
    if user is None:
        raise RuntimeError(
            'Có bản ghi SeatType nhưng chưa có user: hãy tạo user trước khi chạy migration này.'
        )

    SeatType.objects.filter(provider__isnull=True).update(provider_id=user.pk)


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0007_package_remove_hotel_star_rating_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='seattype',
            name='provider',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='seat_types',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RunPython(forwards_assign_seattype_provider, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='seattype',
            name='provider',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='seat_types',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddConstraint(
            model_name='seattype',
            constraint=models.UniqueConstraint(
                fields=('provider', 'name'),
                name='uniq_seat_type_name_per_provider',
            ),
        ),
    ]
