import pika
import json

def enviar_mensagem(mensagem, queue_name):
    print("Conectando em 143.106.5.41")
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="143.106.5.41", port=5672))
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)
    channel.basic_publish(exchange='', routing_key=queue_name, body=json.dumps(mensagem, default=str))

    print(f"Mensagem enviada para {queue_name}")

    connection.close()