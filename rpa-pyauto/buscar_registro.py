import pika
from threading import Thread, Event

executar_agora = Event()

def callback(ch, method, properties, body):
    print("Recebido comando de busca")
    executar_agora.set()

def ouvir_fila():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="143.106.5.41", port=5672))
    channel = connection.channel()
    channel.queue_declare(queue="buscar", durable=True)
    channel.basic_consume(queue="buscar", on_message_callback=callback, auto_ack=True)

    print("Ouvindo fila buscar...")
    channel.start_consuming()