from celery.signals import (after_task_publish, task_prerun, task_success, task_failure)
from .models import Processamento
from django.db import transaction

import redis

redis_client = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)

@task_prerun.connect(weak=False)
def task_iniciada(sender=None, task_id=None, task=None, **kwargs):
    usuario = None
    processo = Processamento.objects.filter(user__isnull=False).first()
    if processo:
        usuario = processo.user
    with transaction.atomic():
        Processamento.objects.update_or_create(task_id=task_id, defaults={"task_id_parent": task.request.parent_id, "status": "PROCESSANDO", "user": usuario})

@after_task_publish.connect(weak=False)
def task_enviada(sender=None, headers=None, **kwargs):

    task_id = headers.get("id")
    task_name = headers.get("task")

    with transaction.atomic():
        Processamento.objects.update_or_create(task_id=task_id, task_name=task_name, defaults={"status": "PENDING"})


@task_success.connect(weak=False)
def task_finalizada(sender=None, result=None, **kwargs):
    task_id = sender.request.id
    processo = Processamento.objects.filter(task_id=task_id).first()

    if not processo:
        print("PROCESSO NÃO ENCONTRADO", flush=True)
        return

    processo.status = "SUCCESS"
    processo.save()
    user = processo.user
    total = Processamento.objects.filter(user=user).count()
    success = Processamento.objects.filter(user=user, status="SUCCESS").count()

    if total > 0 and total == success:
        print("TODAS AS TASKS TERMINARAM!", flush=True)
        Processamento.objects.filter(user=user).delete()
        print("TASKS APAGADAS DO BANCO", flush=True)
        redis_client.publish(f"task_completed:{user}", '{"status": "COMPLETED"}')
        print("MENSAGEM ENVIADA PARA REDIS", flush=True)

@task_failure.connect(weak=False)
def task_erro(sender=None, task_id=None, exception=None, **kwargs):
    print(f"Task {task_id} falhou com exceção: {exception}")
    Processamento.objects.filter(task_id=task_id).update(status="ERRO")
