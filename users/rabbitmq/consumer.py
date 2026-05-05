#producer e um consumer

import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='rabbitmq')
)

channel = connection.channel()

channel.queue_declare(queue='usuarios')

def callback(ch, method, properties, body):
    print("Mensagem recebida:", body.decode())

channel.basic_consume(
    queue='usuarios',
    on_message_callback=callback,
    auto_ack=True
)

print("Aguardando mensagens...")

channel.start_consuming()