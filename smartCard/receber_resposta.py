from operator import call

import pika
import threading

executar_agora = threading.Event()

def callback(ch, method, properties, body):
    print("Recebido comando de busca")
    print(body.decode())
    executar_agora.set()

def ouvir_fila():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="143.106.5.41", port=5672))
    channel = connection.channel()
    channel.queue_declare(queue="buscar_concluido", durable=True)
    channel.basic_consume(queue="buscar_concluido", on_message_callback=callback, auto_ack=True)

    print("Ouvindo fila buscar_concluido...")
    channel.start_consuming()
    
consumer_thread = threading.Thread(target=ouvir_fila, daemon=True)
consumer_thread.start()