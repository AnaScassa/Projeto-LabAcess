from celery import shared_task

from django.contrib.auth import get_user_model

from users.models import UserProfile

import pika
import json

from django.core.serializers.json import DjangoJSONEncoder

User = get_user_model()


@shared_task
def processar_usuarios(task_id):

    users = list(
        User.objects.all().values()
    )

    profiles = list(
        UserProfile.objects.all().values()
    )

    response = {

        "task_id": task_id,

        "users": users,

        "profiles": profiles

    }

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host="rabbitmq"
        )
    )

    channel = connection.channel()

    channel.queue_declare(
        queue="usuarios_resposta",
        durable=True
    )

    channel.basic_publish(

        exchange='',

        routing_key='usuarios_resposta',

        body=json.dumps(
            response,
            cls=DjangoJSONEncoder
        )

    )

    connection.close()

    print("Resposta enviada!")