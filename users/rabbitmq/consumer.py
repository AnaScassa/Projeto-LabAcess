import django
import pika
import json
import requests
import time
import sys
import os

from django.conf import settings

sys.path.append('/app')

os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'users_service.settings'
)

django.setup()

from django.core.cache import cache

connection = None

while connection is None:
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='rabbitmq')
        )

        print("Conectado ao RabbitMQ!")

    except Exception as e:
        print("Aguardando RabbitMQ...", e)
        time.sleep(5)

channel = connection.channel()

channel.queue_declare(queue='usuarios_processados')

def callback(ch, method, properties, body):

    try:
        data = json.loads(body)

        task_id = data["task_id"]

        print("Recebido task_id:", task_id)

        headers = {
            "X-Internal-Key": settings.SECRET_API_KEY
        }

        print(headers)

        profiles_response = requests.get(
            "http://users_service:8000/api/users/internal/profiles/",
            headers={
                **headers,
                "Host": "localhost"
            },
            timeout=10
        )

        print("PROFILE STATUS:", profiles_response.status_code)
        print("PROFILE BODY:")
        print(profiles_response.text[:5000])

        if profiles_response.status_code != 200:
            print("Erro buscando profiles")
            return

        
        users_response = requests.get(
            "http://users_service:8000/api/users/internal/users/",
            headers={
                **headers,
                "Host": "localhost"
            },
            timeout=10
        )

        print("USER STATUS:", users_response.status_code)
        print("USER BODY:")
        print(users_response.text[:5000])

        if users_response.status_code != 200:
            print("Erro buscando users")
            return

        profiles = profiles_response.json()
        users = users_response.json()
        
        cache.set(f"profiles_{task_id}", profiles, timeout=300)
        cache.set(f"users_{task_id}", users, timeout=300)

        print("Dados salvos no cache!")

    except Exception as e:
        print("ERRO NO CONSUMER:", str(e))

channel.basic_consume(
    queue='usuarios_processados',
    on_message_callback=callback,
    auto_ack=True
)

print("Aguardando mensagens...")

channel.start_consuming()

print("Fim do consumer")