from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('smartcard', '0010_auto_apontamento'),
    ]
    operations = [
        migrations.AlterUniqueTogether(
            name='processamento',
            unique_together={('user', 'task_id')}, 
        ),
    ]
