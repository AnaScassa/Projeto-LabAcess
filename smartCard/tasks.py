from django.core.cache import cache
from django.utils import timezone
from django.conf import settings

from celery import shared_task, shared_task
from celery import chain

from .services import vincular_por_matricula
from .models import Usuario, Acesso
from fuzzywuzzy import fuzz

import pandas as pd
import time
from smartcard.rabbitmq.publisher import enviar_mensagem


@shared_task(bind=True)
def processar_xls(self, caminho_arquivo, task_id):
    
    enviar_mensagem("usuarios_processados", {"task_id": task_id})

    profiles = cache.get(f"profiles_{task_id}")
    users = cache.get(f"users_{task_id}")

    print(profiles)
    print(users)

    print("Mensagem enviada para users_service")

    timeout = 30
    inicio = time.time()

    profiles = None
    users = None

    while time.time() - inicio < timeout:

        profiles = cache.get(f"profiles_{task_id}")
        users = cache.get(f"users_{task_id}")

        if profiles and users:
            break

        print("Aguardando dados do users_service...")
        time.sleep(2)

    if not profiles or not users:
        raise Exception("Timeout esperando users_service")

    print("Dados recebidos!")

    df = pd.read_excel(caminho_arquivo)

    for _, row in df.iterrows():

        matricula = str(row.get("MATRICULA", "")).strip()

        print(matricula)


@shared_task(bind=True)
def tentar_vincular_user_auth(self, usuario_id):

    self.update_state(state="STARTED")

    profiles = cache.get("profiles")
    users = cache.get("users")

    if not profiles or not users:
        print("Cache vazio!")
        return False

    usuario = Usuario.objects.filter(
        id=usuario_id,
        user_auth__isnull=True
    ).first()

    if not usuario:
        return False

    vinculou = vincular_por_matricula(usuario, profiles)

    if not vinculou:
        tentar_vincular_por_nome.delay(usuario.id)

    return vinculou

@shared_task(bind=True)
def tentar_vincular_por_nome(self, usuario_id):
    self.update_state(state="STARTED")

    users = cache.get("users")

    if not users:
        print("Cache users vazio!")
        return False

    usuario = Usuario.objects.filter(
        id=usuario_id,
        user_auth__isnull=True
    ).first()

    if not usuario or not usuario.nome_usuario:
        return False

    nome_usuario = usuario.nome_usuario.lower().strip()
    melhor = None
    score_max = 0

    for user in users:
        nome_db = (user.get("full_name") or "").lower().strip()
        if not nome_db:
            continue

        score = fuzz.token_sort_ratio(nome_usuario, nome_db)
        if score > score_max:
            score_max = score
            melhor = user

    if melhor and score_max >= 70:
        usuario.user_auth = melhor.get("id")
        usuario.save(update_fields=["user_auth"])
        return True

    return False

def marcar_apontamento2(acesso):
    if acesso.desc_evento == "Apontamento Normal":
        acesso.apontamento = 2
        acesso.save(update_fields=["apontamento"])


def corrigir_entradas_saida_inconsistentes():
    for usuario in Usuario.objects.all():
        for area in Acesso.objects.filter(usuario=usuario).values_list('desc_area', flat=True).distinct():
            acessos = Acesso.objects.filter(usuario=usuario, desc_area=area).order_by('data_acesso')
            stack = None
            for acesso in acessos:
                if acesso.ent_sai == '1':  
                    if stack is not None:
                        marcar_apontamento2(acesso)
                    stack = acesso
                else:  
                    if stack is None:  
                        marcar_apontamento2(acesso)
                    else:
                        if not mesmoDia(stack.data_acesso, acesso.data_acesso):
                            marcar_apontamento2(stack)
                        stack = None
            if stack:
                marcar_apontamento2(stack)


def mesmoDia(data1, data2):
    if not data1 or not data2:
        return False

    data1_local = timezone.localtime(data1)
    data2_local = timezone.localtime(data2)

    return (
        data1_local.year == data2_local.year and
        data1_local.month == data2_local.month and
        data1_local.day == data2_local.day
    )