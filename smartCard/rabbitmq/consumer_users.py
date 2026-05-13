# smartcard/rabbitmq/consumer.py

import pika
import json
import time
import os
import django
import sys

sys.path.append("/app")

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "core.settings"
)

django.setup()

from django.core.cache import cache

connection = None

while connection is None:

    try:

        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host="rabbitmq"
            )
        )

        print("Conectado RabbitMQ!")

    except Exception as e:

        print("Aguardando RabbitMQ...", e)

        time.sleep(5)

channel = connection.channel()

channel.queue_declare(
    queue="usuarios_resposta",
    durable=True
)

def callback(ch, method, properties, body):

    data = json.loads(body)

    task_id = data["task_id"]

    cache.set(

        f"users_response_{task_id}",

        data,

        timeout=300

    )

    print("Resposta salva no cache!")

channel.basic_consume(

    queue="usuarios_resposta",

    on_message_callback=callback,

    auto_ack=True

)

print("Aguardando respostas...")

channel.start_consuming()