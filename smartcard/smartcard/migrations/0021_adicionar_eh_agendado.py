from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("smartcard", "0020_remove_notificacaousuario_notificacao_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="acesso",
            name="eh_agendado",
            field=models.BooleanField(default=True),
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AddField(
                    model_name="notificacaousuario",
                    name="usuario_id",
                    field=models.BigIntegerField(),
                ),
                migrations.AlterField(
                    model_name="notificacaousuario",
                    name="acesso",
                    field=models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.CASCADE,
                        related_name="notificacoes",
                        to="smartcard.acesso",
                    ),
                ),
            ],
        ),
    ]