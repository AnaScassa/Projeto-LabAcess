from celery.signals import after_task_publish, task_prerun, task_success, task_failure
from .models import Processamento
from django.db import transaction
import redis

redis_client = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)

@after_task_publish.connect(weak=False)
def task_enviada(sender=None, headers=None, **kwargs):
    task_id = headers.get("id")
    task_name = headers.get("task")

    processo = Processamento.objects.filter(task_id=task_id).first()

    if processo:
        processo.task_name = task_name
        processo.status = "PENDING"
        processo.save()
    else:
        print(f"PROCESSAMENTO NÃO ENCONTRADO AO ENVIAR TASK: {task_id}", flush=True)

@task_prerun.connect(weak=False)
def task_iniciada(sender=None, task_id=None, task=None, **kwargs):
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
        Processamento.objects.filter(user=user).delete()
        redis_client.publish(f"task_completed:{user}", '{"status": "COMPLETED"}')

@task_failure.connect(weak=False)
def task_erro(sender=None, task_id=None, exception=None, **kwargs):
    print(f"Task {task_id} falhou com exceção: {exception}", flush=True)
    Processamento.objects.filter(task_id=task_id).update(status="ERRO")