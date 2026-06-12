import json
import base64
from io import BytesIO
import pika
import requests
import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

django.setup()

from core.settings import SECRET_API_KEY

def callback_csv(ch, method, properties, body):
    print("CHEGOU NO CALLBACK")

    try:
        dados = json.loads(body)

        nome = dados["nome"]

        conteudo = base64.b64decode(
            dados["conteudo"]
        )

        arquivo = BytesIO(conteudo)

        response = requests.post("http://backend:8000/api/acesso/upload-xls/",
            headers={
                "Authorization": f"{SECRET_API_KEY}"
            },
            files={
                "file": (nome, arquivo, "text/csv")
            }
        )

        print("Status:", response.status_code)
        print("Resposta:", response.text)

        if response.status_code in [200, 201, 202]:
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    except Exception as e:
        print("Erro callback:", repr(e))

        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

try:
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="rabbitmq", port=5672, credentials=pika.PlainCredentials("guest", "guest")))
    print("Conectado ao RabbitMQ!")

except Exception as e:
    print("Erro ao conectar:", repr(e))
    raise

channel = connection.channel()
channel.queue_declare(queue="csvs")
channel.basic_consume(queue="csvs", on_message_callback=callback_csv)
channel.start_consuming()