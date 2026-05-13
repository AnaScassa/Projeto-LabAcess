import pika
import json

def enviar_mensagem(queue_name, mensagem):

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host='rabbitmq'
        )
    )

    channel = connection.channel()

    channel.queue_declare(
        queue=queue_name,
        durable=True
    )

    channel.basic_publish(

        exchange='',

        routing_key=queue_name,

        body=json.dumps(
            mensagem,
            default=str
        )

    )

    print(f"Mensagem enviada para {queue_name}")

    connection.close()