import django
import pika
import json
import os
import sys
import time

sys.path.append("/app")

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "users_service.settings"
)

django.setup()

from django.contrib.auth import get_user_model
from users.models import UserProfile

User = get_user_model()

connection = None

while connection is None:

    try:

        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host="rabbitmq"
            )
        )

        print("Conectado RabbitMQ")

    except Exception as e:

        print("Aguardando RabbitMQ...", e)
        time.sleep(5)

channel = connection.channel()

channel.queue_declare(
    queue="usuarios_processados",
    durable=True
)

channel.queue_declare(
    queue="usuarios_resposta",
    durable=True
)

def callback(ch, method, properties, body):

    try:

        data = json.loads(body)

        task_id = data["task_id"]

        print(f"Recebido task_id: {task_id}")

        users = list(
            User.objects.all().values()
        )

        profiles = list(
            UserProfile.objects.all().values()
        )

        resposta = {

            "task_id": task_id,
            "users": users,
            "profiles": profiles

        }

        channel.basic_publish(

            exchange='',

            routing_key='usuarios_resposta',

            body=json.dumps(resposta, default=str)

        )

        print("Dados enviados")

    except Exception as e:

        print("ERRO:", str(e))

channel.basic_consume(

    queue="usuarios_processados",

    on_message_callback=callback,

    auto_ack=True

)

print("Aguardando mensagens...")
channel.start_consuming()