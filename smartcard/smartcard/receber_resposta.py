import pika
import threading
import json
import os
import time
from django.utils import timezone
from django.db import DatabaseError
from .models import LoggerErro
import redis

executar_agora = threading.Event()
redis_client = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)
REDIS_KEY_ULTIMA_RESPOSTA = "ultima_resposta_rpa"
REDIS_CANAL_RESPOSTA = "resposta_rpa"
REDIS_KEY_HEARTBEAT_RPA = "heartbeat_rpa"
FILA_HEARTBEAT_RPA = "rpa_heartbeat"
FILA_ERROS_RPA = "rpa_erros"

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
    credentials = pika.PlainCredentials(os.getenv("RABBITMQ_USER", "guest"), os.getenv("RABBITMQ_PASSWORD", "guest"),)
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=os.getenv("RABBITMQ_HOST", "rabbitmq"), port=int(os.getenv("RABBITMQ_PORT", "5672")), credentials=credentials,))
    channel = connection.channel()
    channel.queue_declare(queue="buscar_concluido", durable=True)
    channel.basic_consume(queue="buscar_concluido", on_message_callback=callback, auto_ack=True)
    channel.start_consuming()

def receber_heartbeat(ch, method, properties, body):
    try:
        dados = json.loads(body)
        if not isinstance(dados, dict):
            raise ValueError("Heartbeat do RPA deve ser um objeto JSON.")

        recebido_em = timezone.now().isoformat()
        redis_client.set(
            REDIS_KEY_HEARTBEAT_RPA,
            json.dumps({"recebido_em": recebido_em, "enviado_em": dados.get("enviado_em")}),
            ex=90,
        )
        ch.basic_ack(method.delivery_tag)
    except (TypeError, ValueError):
        ch.basic_nack(method.delivery_tag, requeue=False)
        print("Heartbeat inválido recebido do RPA.")

def ouvir_heartbeat_rpa():
    while True:
        connection = None
        try:
            credentials = pika.PlainCredentials(
                os.getenv("RABBITMQ_USER", "guest"),
                os.getenv("RABBITMQ_PASSWORD", "guest"),
            )
            connection = pika.BlockingConnection(pika.ConnectionParameters(
                host=os.getenv("RABBITMQ_HOST", "rabbitmq"),
                port=int(os.getenv("RABBITMQ_PORT", "5672")),
                credentials=credentials,
                heartbeat=60,
                blocked_connection_timeout=30,
            ))
            channel = connection.channel()
            channel.queue_declare(queue=FILA_HEARTBEAT_RPA, durable=True)
            channel.basic_consume(queue=FILA_HEARTBEAT_RPA, on_message_callback=receber_heartbeat)
            channel.start_consuming()
        except (pika.exceptions.AMQPError, OSError) as erro:
            print(f"Erro ao receber heartbeat do RPA: {erro!r}")
            time.sleep(5)
        finally:
            if connection and connection.is_open:
                connection.close()


def receber_erro_rpa(ch, method, properties, body):
    try:
        dados = json.loads(body)
        if not isinstance(dados, dict):
            raise ValueError("Erro do RPA deve ser um objeto JSON.")

        mensagem = dados.get("mensagem")
        if not isinstance(mensagem, str) or not mensagem.strip():
            raise ValueError("A mensagem de erro do RPA é obrigatória.")
    except (json.JSONDecodeError, UnicodeDecodeError, TypeError, ValueError) as erro:
        print(f"Mensagem de erro inválida recebida do RPA: {erro}")
        ch.basic_nack(method.delivery_tag, requeue=False)
        return

    LoggerErro.objects.create(mensagem=mensagem)
    ch.basic_ack(method.delivery_tag)


def ouvir_erros_rpa():
    while True:
        connection = None
        try:
            credentials = pika.PlainCredentials(
                os.getenv("RABBITMQ_USER", "guest"),
                os.getenv("RABBITMQ_PASSWORD", "guest"),
            )
            connection = pika.BlockingConnection(pika.ConnectionParameters(
                host=os.getenv("RABBITMQ_HOST", "rabbitmq"),
                port=int(os.getenv("RABBITMQ_PORT", "5672")),
                credentials=credentials,
                heartbeat=60,
                blocked_connection_timeout=30,
            ))
            channel = connection.channel()
            channel.queue_declare(queue=FILA_ERROS_RPA, durable=True)
            channel.basic_consume(queue=FILA_ERROS_RPA, on_message_callback=receber_erro_rpa)
            channel.start_consuming()
        except (pika.exceptions.AMQPError, OSError, DatabaseError) as erro:
            print(f"Erro ao receber erros do RPA: {erro!r}")
            time.sleep(5)
        finally:
            if connection and connection.is_open:
                connection.close()


consumer_thread = threading.Thread(target=ouvir_fila, daemon=True)
consumer_thread.start()
heartbeat_thread = threading.Thread(target=ouvir_heartbeat_rpa, daemon=True)
heartbeat_thread.start()
erro_rpa_thread = threading.Thread(target=ouvir_erros_rpa, daemon=True)
erro_rpa_thread.start()