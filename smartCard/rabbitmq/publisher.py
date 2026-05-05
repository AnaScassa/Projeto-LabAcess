# smartcard/rabbitmq/publisher.py

import pika
import json

def enviar_mensagem(mensagem):

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='rabbitmq')
    )

    channel = connection.channel()

    channel.queue_declare(queue='usuarios')

    channel.basic_publish(
        exchange='',
        routing_key='usuarios',
        body=json.dumps(mensagem)
    )

    print("Mensagem enviada:", mensagem)

    connection.close()