import threading
import pika
import json
import time
from django.contrib.auth import get_user_model
from users.models import UserProfile
from django.core.cache import cache

User = get_user_model()


def iniciar_consumer():
    
    connection = None

    while connection is None:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host="rabbitmq"))
            print("Conectado RabbitMQ")

        except Exception as e:
            print(f"Aguardando RabbitMQ... {e}")
            time.sleep(5)

    channel = connection.channel()
    channel.queue_declare(queue='usuarios_processados', durable=True)

    def callback(ch, method, properties, body):

        try:
            data = json.loads(body)
            task_id = data["task_id"]
            
            users = list(User.objects.all().values())
            profiles = list(UserProfile.objects.all().values())
            
            cache.set("users_global", {f"users_{task_id}": users, f"profiles_{task_id}": profiles}, timeout=3600)
            
            
            resposta = {
                "users": f"users_{task_id}",
                "profiles": f"profiles_{task_id}",
                "status": "success"
            }

            ch.basic_publish(exchange='', routing_key=properties.reply_to, properties=pika.BasicProperties
                (correlation_id=properties.correlation_id), body=json.dumps(resposta, default=str))
            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            print(f"ERRO: {str(e)}")
            resposta = {
                "status": "error",
            }

    channel.basic_consume(queue='usuarios_processados', on_message_callback=callback)
    channel.start_consuming()

consumer_thread = threading.Thread(target=iniciar_consumer, daemon=True)
consumer_thread.start()