import pika
import json

from config import RABBITMQ_HOST, RABBITMQ_PASSWORD, RABBITMQ_PORT, RABBITMQ_USER

def enviar_mensagem(mensagem, queue_name):
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)
    
    channel.basic_publish(exchange='', routing_key=queue_name, body=json.dumps(mensagem, default=str),
        properties=pika.BasicProperties(delivery_mode=pika.DeliveryMode.Persistent),
    )
    
    connection.close()