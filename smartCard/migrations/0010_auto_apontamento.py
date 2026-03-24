from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('smartcard', '0009_processamento_task_id_parent_processamento_user'), 
    ]
    operations = [
        migrations.AddField(
            model_name='acesso',
            name='apontamento',
            field=models.IntegerField(default=0),
        ),
    ]
