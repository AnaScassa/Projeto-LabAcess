from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("smartcard", "0026_emails_metadata_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="usuario",
            name="esta_ativo",
            field=models.BooleanField(default=True),
        ),
    ]
