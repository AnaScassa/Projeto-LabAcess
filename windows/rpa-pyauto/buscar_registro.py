import json
import time
from queue import Queue
import pika

from config import (RABBITMQ_HOST, RABBITMQ_PASSWORD, RABBITMQ_PORT, RABBITMQ_QUEUE, RABBITMQ_USER,)

fila_busca = Queue()

def callback(ch, method, properties, body):
    mensagem = json.loads(body.decode())
    fila_busca.put(mensagem)
    ch.basic_ack(method.delivery_tag)

def ouvir_fila():
    while True:
        connection = None
        try:
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
            parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials, heartbeat=60, blocked_connection_timeout=30)
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
            channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=callback, auto_ack=False)
            print(f"Conectado ao RabbitMQ em {RABBITMQ_HOST}:{RABBITMQ_PORT}; fila: {RABBITMQ_QUEUE}")
            channel.start_consuming()
            
        except pika.exceptions.ConnectionClosedByBroker as e:
            print(f"RabbitMQ desligado ({e}); tentando reconectar em 5 segundos...")
            time.sleep(5)
            
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Erro ao ouvir fila: {e!r}")
            time.sleep(5)
            
        finally:
            if connection and connection.is_open:
                connection.close()