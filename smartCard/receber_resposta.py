import pika
import threading
import json
from django.utils import timezone
from .models import Resposta

executar_agora = threading.Event()

def callback(ch, method, properties, body):
    print("Recebido comando de busca")
    dados = json.loads(body)
    quantidade = dados.get("total_linhas", 0)
    status = dados.get("status", "PENDING")
    print("Quantidade:", quantidade)
    print("Status:", status)

    resposta = Resposta.objects.first()

    if resposta is None:
        Resposta.objects.create(status=status, quantidade=quantidade, criado_em=timezone.now())
    else:
        resposta.status = status
        resposta.quantidade = quantidade
        resposta.criado_em = timezone.now()
        resposta.save()

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