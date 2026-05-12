import django
import pika
import json
import requests
import time
import sys
import os

from decouple import config

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

        print("✓ Conectado ao RabbitMQ!")

    except Exception as e:

        print("Aguardando RabbitMQ...", e)

        time.sleep(5)

channel = connection.channel()

channel.queue_declare(queue='usuarios_processados')

def callback(ch, method, properties, body):

    try:

        data = json.loads(body)

        task_id = data["task_id"]

        token = config("USERS_SERVICE_JWT")

        if not token:
            raise Exception("JWT não enviado")

        print("Recebido task_id:", task_id)

        headers = {
            "Authorization": f"Bearer {token}"
        }

        hosts = [
            "users_service:8000",
            "127.0.0.1:8000",
            "localhost:8000"
        ]

        response = None

        for host in hosts:

            try:

                url = f"http://{host}/api/users/internal/all-data/"

                print(f"Tentando {url}...")

                response = requests.get(
                    url,
                    headers=headers,
                    timeout=5
                )

                print("STATUS:", response.status_code)

                if response.status_code == 200:

                    print(f"✓ Sucesso com {host}")

                    break

                else:

                    print("Erro:", response.text)

            except Exception as e:

                print(f"Falha com {host}: {e}")

                continue

        if response is None:
            raise Exception("Nenhum host respondeu")

        if response.status_code != 200:
            raise Exception("Erro buscando dados")

        data = response.json()

        profiles = data.get("profiles", [])
        users = data.get("users", [])

        cache.set(
            f"profiles_{task_id}",
            profiles,
            timeout=300
        )

        cache.set(
            f"users_{task_id}",
            users,
            timeout=300
        )

        print("✓ Dados salvos no cache!")

        print(f"  - {len(users)} usuários")
        print(f"  - {len(profiles)} profiles")

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