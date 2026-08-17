from django.core.management.base import BaseCommand
from users.factories import seed_database

class Command(BaseCommand):
    help = "Popula o banco com dados fake"

    def handle(self, *args, **kwargs):
        seed_database()
        self.stdout.write(self.style.SUCCESS("Banco populado com sucesso!"))