from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Adiciona dados dos usuarios"


    def handle(self, *args, **options):
        call_command('loaddata', "./fixtures/01_default_user_group.json")
        call_command('loaddata', "./fixtures/02_degreearea.json")
        call_command('loaddata', "./fixtures/02_degreearea.json")
        call_command('loaddata', "./fixtures/03_position.json")
        call_command('loaddata', "./fixtures/04_userdata.json")
        call_command('loaddata', "./fixtures/05_userprofile.json")
        call_command('loaddata', "./fixtures/06_account.json")
        call_command('loaddata', "./fixtures/07_safetytraining.json")
