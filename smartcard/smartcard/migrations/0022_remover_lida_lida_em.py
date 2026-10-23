from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('smartcard', '0021_adicionar_eh_agendado'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notificacaousuario',
            name='lida',
        ),
        migrations.RemoveField(
            model_name='notificacaousuario',
            name='lida_em',
        ),
    ]
