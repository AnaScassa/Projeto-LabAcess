from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('smartcard', '0023_remove_cruzamentoapi_acesso_and_more'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.DeleteModel(
                    name='CruzamentoApi',
                ),
            ],
            state_operations=[
                migrations.RemoveField(
                    model_name='cruzamentoapi',
                    name='acesso',
                ),
                migrations.RemoveField(
                    model_name='cruzamentoapi',
                    name='usuario',
                ),
                migrations.RemoveConstraint(
                    model_name='notificacaousuario',
                    name='unique_notificacao_usuario',
                ),
                migrations.RemoveField(
                    model_name='notificacaousuario',
                    name='usuario',
                ),
                migrations.DeleteModel(
                    name='CruzamentoApi',
                ),
            ],
        ),
    ]
