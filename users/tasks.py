import threading
import pika
import json
import time
from celery import shared_task
from django.contrib.auth import get_user_model
from users.models import UserProfile
from django.core.serializers.json import DjangoJSONEncoder

User = get_user_model()


@shared_task
def processar_usuarios(task_id):
    try:
        users = list(User.objects.all().values())
        profiles = list(UserProfile.objects.all().values())

        response = {
            "task_id": task_id,
            "users": users,
            "profiles": profiles
        }

        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host="rabbitmq")
        )

        channel = connection.channel()
        channel.queue_declare(queue="usuarios_resposta", durable=True)
        channel.basic_publish(
            exchange='',
            routing_key='usuarios_resposta',
            body=json.dumps(response, cls=DjangoJSONEncoder)
        )
        connection.close()

        print(f"Resposta enviada para task_id: {task_id}")

    except Exception as e:
        print(f"ERRO ao processar usuarios: {str(e)}")
        raise

def iniciar_consumer():
    connection = None

    while connection is None:
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host="rabbitmq")
            )
            print("Conectado RabbitMQ")
        except Exception as e:
            print(f"Aguardando RabbitMQ... {e}")
            time.sleep(5)

    channel = connection.channel()
    channel.queue_declare(queue="usuarios_processados", durable=True)
    channel.queue_declare(queue="usuarios_resposta", durable=True)

    def callback(ch, method, properties, body):
        try:
            data = json.loads(body)
            task_id = data["task_id"]

            print(f"Recebido task_id: {task_id}")

            processar_usuarios.delay(task_id)

            print(f"Tarefa Celery disparada para task_id: {task_id}")

        except Exception as e:
            print(f"ERRO: {str(e)}")

    channel.basic_consume(
        queue="usuarios_processados",
        on_message_callback=callback,
        auto_ack=True
    )

    print("Aguardando mensagens do smartcard...")
    channel.start_consuming()

consumer_thread = threading.Thread(target=iniciar_consumer, daemon=True)
consumer_thread.start()
