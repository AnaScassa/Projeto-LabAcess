import pika
import threading
import json
from django.utils import timezone
import redis

executar_agora = threading.Event()
redis_client = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)
REDIS_KEY_ULTIMA_RESPOSTA = "ultima_resposta_rpa"
REDIS_CANAL_RESPOSTA = "resposta_rpa"

def publicar_resposta_no_redis(status, quantidade):
    payload = {"status": status, "quantidade": quantidade, "criado_em": timezone.now().isoformat()}
    redis_client.set(REDIS_KEY_ULTIMA_RESPOSTA, json.dumps(payload))
    redis_client.publish(REDIS_CANAL_RESPOSTA, json.dumps(payload))

    return payload

def callback(ch, method, properties, body):
    dados = json.loads(body)
    quantidade = dados.get("total_linhas", 0)
    status = dados.get("status", "PENDING")
    publicar_resposta_no_redis(status, quantidade)
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