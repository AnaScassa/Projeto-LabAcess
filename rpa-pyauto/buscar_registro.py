import json
import pika
from threading import Event
from queue import Queue

executar_agora = Event()
fila_busca = Queue()
dados_busca = {}

def callback(ch, method, properties, body):
    print("CALLBACK EXECUTOU")

    mensagem = json.loads(body.decode())

    print("Mensagem recebida:")
    print(mensagem)

    fila_busca.put(mensagem)
    executar_agora.set()


def ouvir_fila():
    print("Iniciando conexão RabbitMQ")

    connection = pika.BlockingConnection(pika.ConnectionParameters(host="143.106.5.41", port=5672))

    print("Conectado RabbitMQ")
    channel = connection.channel()
    channel.queue_declare(queue="buscar", durable=True)
    channel.basic_consume(queue="buscar", on_message_callback=callback, auto_ack=True)

    print("Ouvindo fila buscar...")

    channel.start_consuming()