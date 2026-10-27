from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("smartcard", "0024_remove_cruzamentoapi_acesso_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="LoggerErro",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("mensagem", models.TextField()),
                ("data", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "db_table": "logger_erro",
                "ordering": ["-data", "-id"],
            },
        ),
    ]
