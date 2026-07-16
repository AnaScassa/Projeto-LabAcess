import random
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model

from smartcard.factories import SmartcardUsuarioFactory, AcessoFactory

# COMANDOS PARA POPULAR O BANCO DE DADOS COM DADOS FICTÍCIOS
# docker exec -it smartcard_backend python manage.py shell
# from smartcard.populate import popular_banco
#  popular_banco()

User = get_user_model()

def criar_acessos(usuario, quantidade_dias=10):
    for _ in range(quantidade_dias):
        erro = random.random() < 0.1  

        entrada = timezone.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 5))

        AcessoFactory.create(usuario=usuario, data_acesso=entrada, ent_sai=1)

        if not erro:
            saida = entrada + timedelta(hours=random.randint(1, 10))

            AcessoFactory.create(usuario=usuario, data_acesso=saida, ent_sai=0)

def popular_banco():
    print("Verificando usuários base...")

    if User.objects.count() == 0:
        print("Nenhum User encontrado! Rode o loaddata primeiro.")
        return

    print("Criando usuários smartcard...")

    usuarios = SmartcardUsuarioFactory.create_batch(10)

    print("Criando acessos...")

    for usuario in usuarios:
        criar_acessos(usuario, quantidade_dias=20)

    print("Banco populado com sucesso!")