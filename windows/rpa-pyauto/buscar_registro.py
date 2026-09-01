import json
from queue import Queue
import pika


fila_busca = Queue()


def callback(ch, method, properties, body):
    mensagem = json.loads(body.decode())
    fila_busca.put(mensagem)
    ch.basic_ack(method.delivery_tag)


def ouvir_fila():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="143.106.5.41", port=5672))
    channel = connection.channel()
    channel.queue_declare(queue="buscar", durable=True)
    channel.basic_consume(queue="buscar", on_message_callback=callback, auto_ack=False)
    channel.start_consuming()
