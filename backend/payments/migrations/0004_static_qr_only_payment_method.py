from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0003_payment_expires_at_alter_payment_payment_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="payment",
            name="payment_method",
            field=models.CharField(
                choices=[("STATIC_QR", "Static QR")],
                max_length=20,
            ),
        ),
    ]
