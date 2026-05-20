from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0004_booking_expire_at"),
    ]

    operations = [
        migrations.RenameField(
            model_name="booking",
            old_name="expire_at",
            new_name="expires_at",
        ),
    ]
