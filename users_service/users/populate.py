import random
from django.utils import timezone
from datetime import timedelta

from .factories import (UserFactory,UserProfileFactory,DegreeAreaFactory)

# COMANDOS PARA POPULAR O BANCO DE DADOS COM DADOS FICTÍCIOS
# docker exec -it smartcard_backend python manage.py shell
# from users.populate import popular_banco_completo
# popular_banco_completo()

def popular_users(qtd=20):
    users = []
    areas = DegreeAreaFactory.create_batch(5)

    for _ in range(qtd):
        user = UserFactory()

        UserProfileFactory(
            user=user,
            degree_area=random.sample(areas, random.randint(1, 3))
        )


        users.append(user)

    return users


def popular_grupos(users, qtd=10):
    for _ in range(qtd):
        data = timezone.now() + timedelta(days=random.randint(-15, 15))


def popular_banco_completo():
    print("Criando usuários e perfis...")

    users = popular_users(20)

    print("Criando grupos...")

    popular_grupos(users, 10)

    print("Banco populado com sucesso!")