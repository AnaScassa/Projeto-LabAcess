from celery.signals import after_task_publish, task_prerun, task_success, task_failure
from .models import Processamento
from django.db import transaction

LIMPEZA_TASK_NAME = "smartcard.tasks.verificar_limpeza_processamento"
LIMPEZA_APOS_SEGUNDOS = 30


def _eh_task_limpeza(task):
    return getattr(task, "name", task) == LIMPEZA_TASK_NAME


def _agendar_verificacao_limpeza(user):
    if user is None:
        return

    from .tasks import verificar_limpeza_processamento

    verificar_limpeza_processamento.apply_async(args=[user], countdown=LIMPEZA_APOS_SEGUNDOS)


@after_task_publish.connect(weak=False)
def task_enviada(sender=None, headers=None, **kwargs):
    headers = headers or {}
    task_id = headers.get("id")
    task_name = headers.get("task") or sender
    if _eh_task_limpeza(task_name):
        return
    parent_id = headers.get("parent_id")

    processo = Processamento.objects.filter(task_id=task_id).first()

    if processo:
        processo.task_name = task_name
        processo.status = "PENDING"
        processo.save()
    else:
        processo_pai = Processamento.objects.filter(task_id=parent_id).first()
        Processamento.objects.create(task_id=task_id, task_id_parent=parent_id, status="PENDING", user=processo_pai.user if processo_pai else None, task_name=task_name)

@task_prerun.connect(weak=False)
def task_iniciada(sender=None, task_id=None, task=None, **kwargs):
    if _eh_task_limpeza(task):
        return

    parent_id = task.request.parent_id
    processo_atual = Processamento.objects.filter(task_id=task_id).first()
    usuario = processo_atual.user if processo_atual else None

    if usuario is None and parent_id:
        processo_pai = Processamento.objects.filter(task_id=parent_id).first()

        if processo_pai:
            usuario = processo_pai.user

    with transaction.atomic():
        Processamento.objects.update_or_create(task_id=task_id, defaults={"task_id_parent": parent_id, "status": "PROCESSANDO", "user": usuario, "task_name": task.name})

@task_success.connect(weak=False)
def task_finalizada(sender=None, result=None, **kwargs):
    if _eh_task_limpeza(sender):
        return

    task_id = sender.request.id
    processo = Processamento.objects.filter(task_id=task_id).first()

    if not processo:
        print("PROCESSO NÃO ENCONTRADO", flush=True)
        return

    processo.status = "SUCCESS"
    processo.save()
    _agendar_verificacao_limpeza(processo.user)

@task_failure.connect(weak=False)
def task_erro(sender=None, task_id=None, exception=None, **kwargs):
    if _eh_task_limpeza(sender):
        return

    print(f"Task {task_id} falhou com exceção: {exception}", flush=True)
    Processamento.objects.filter(task_id=task_id).update(status="ERRO")
    processo = Processamento.objects.filter(task_id=task_id).first()
    if processo:
        _agendar_verificacao_limpeza(processo.user)