import pika
import json
import time
from threading import Lock

from config import RABBITMQ_HOST, RABBITMQ_PASSWORD, RABBITMQ_PORT, RABBITMQ_USER

_COOLDOWN_APOS_FALHA_SEGUNDOS = 30
_proxima_tentativa = 0.0
_lock_tentativas = Lock()


def enviar_mensagem(mensagem, queue_name) -> bool:
    global _proxima_tentativa

    with _lock_tentativas:
        if time.monotonic() < _proxima_tentativa:
            return False

    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    connection = None

    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue=queue_name, durable=True)
        channel.basic_publish(exchange='', routing_key=queue_name, body=json.dumps(mensagem, default=str), 
            properties=pika.BasicProperties(delivery_mode=pika.DeliveryMode.Persistent),
        )
        with _lock_tentativas:
            _proxima_tentativa = 0.0
        return True
    except (pika.exceptions.AMQPError, OSError):
        with _lock_tentativas:
            _proxima_tentativa = time.monotonic() + _COOLDOWN_APOS_FALHA_SEGUNDOS
        return False
    finally:
        if connection is not None and connection.is_open:
            try:
                connection.close()
            except (pika.exceptions.AMQPError, OSError):
                pass