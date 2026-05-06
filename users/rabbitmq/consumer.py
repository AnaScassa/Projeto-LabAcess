import django
import pika
import json
import requests
import time
import sys
import os

sys.path.append('/app')

os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'users_service.settings'
)

import django
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
            "X-Api-Key": "pbkdf2_sha256$1000000$EaYqRbLmLW9yWEEFxzLD7G$3OxMES/nb5+z6zqCtA9UmDKRGWvLL0Fp46KMdR5CEJY=",
            "Authorization": f"Api-Key Nq5UAGLV.YuZjPXxyvJ1kclWNprTeIxPTAZcqnhza"
        }
        
        print(headers)

        profiles = requests.get(
            "http://users_service:8001/api/users/user-profile/",
            headers=headers,
            timeout=10
        ).json()

        users = requests.get(
            "http://users_service:8001/api/users/user/",
            headers=headers,
            timeout=10
        ).json()

        cache.set(f"profiles_{task_id}", profiles, timeout=600)
        cache.set(f"users_{task_id}", users, timeout=600)

        print("Dados salvos no cache!")

    except Exception as e:
        print("ERRO NO CONSUMER:", e)

channel.basic_consume(
    queue='usuarios_processados',
    on_message_callback=callback,
    auto_ack=True
)

print("Aguardando mensagens...")

channel.start_consuming()

print("Fim do consumer")