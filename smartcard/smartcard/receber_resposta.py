import logging
import threading
import json
import os
import time
from django.utils import timezone
from django.db import DatabaseError
from .models import LoggerErro
import redis
import paho.mqtt.client as mqtt

logger = logging.getLogger(__name__)
executar_agora = threading.Event()
redis_client = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)
REDIS_KEY_ULTIMA_RESPOSTA = "ultima_resposta_rpa"
REDIS_CANAL_RESPOSTA = "resposta_rpa"
REDIS_KEY_HEARTBEAT_RPA = "heartbeat_rpa"
TOPICO_STATUS_RPA = "smartcard/rpa/status"
TOPICO_HEARTBEAT_RPA = "smartcard/rpa/heartbeat"
TOPICO_ERROS_RPA = "smartcard/rpa/errors"

def publicar_resposta_no_redis(status, quantidade):
    payload = {"status": status, "quantidade": quantidade, "criado_em": timezone.now().isoformat()}
    redis_client.set(REDIS_KEY_ULTIMA_RESPOSTA, json.dumps(payload))
    redis_client.publish(REDIS_CANAL_RESPOSTA, json.dumps(payload))

    return payload

def _confirmar_mensagem(cliente, mensagem):
    if mensagem.qos:
        resultado = cliente.ack(mensagem.mid, mensagem.qos)
        if resultado != mqtt.MQTT_ERR_SUCCESS:
            logger.error("Não foi possível confirmar a mensagem MQTT %s.", mensagem.mid)


def _ao_conectar(cliente, userdata, flags, reason_code, properties):
    if reason_code.is_failure:
        logger.error("RabbitMQ MQTT recusou a conexão do SmartCard: %s", reason_code)
        return

    resultado, _ = cliente.subscribe(
        [
            (TOPICO_STATUS_RPA, 1),
            (TOPICO_HEARTBEAT_RPA, 0),
            (TOPICO_ERROS_RPA, 1),
        ]
    )
    if resultado != mqtt.MQTT_ERR_SUCCESS:
        logger.error("Não foi possível assinar os tópicos MQTT do RPA: código %s", resultado)
        return

    logger.info("SmartCard conectado ao RabbitMQ MQTT para receber status, heartbeat e erros do RPA.")


def _ao_receber_mensagem(cliente, userdata, mensagem):
    try:
        dados = json.loads(mensagem.payload)
        if not isinstance(dados, dict):
            raise ValueError("A mensagem MQTT do RPA deve ser um objeto JSON.")
    except (json.JSONDecodeError, UnicodeDecodeError, TypeError, ValueError) as erro:
        logger.error("Mensagem MQTT inválida recebida no tópico %s: %s", mensagem.topic, erro)
        _confirmar_mensagem(cliente, mensagem)
        return

    try:
        if mensagem.topic == TOPICO_STATUS_RPA:
            publicar_resposta_no_redis(
                dados.get("status", "PENDING"),
                dados.get("total_linhas", 0),
            )
            executar_agora.set()
        elif mensagem.topic == TOPICO_HEARTBEAT_RPA:
            recebido_em = timezone.now().isoformat()
            redis_client.set(
                REDIS_KEY_HEARTBEAT_RPA,
                json.dumps({"recebido_em": recebido_em, "enviado_em": dados.get("enviado_em")}),
                ex=90,
            )
        elif mensagem.topic == TOPICO_ERROS_RPA:
            texto_erro = dados.get("mensagem")
            if not isinstance(texto_erro, str) or not texto_erro.strip():
                logger.error("Mensagem de erro do RPA sem o campo obrigatório 'mensagem'.")
            else:
                LoggerErro.objects.create(mensagem=texto_erro)
        else:
            logger.warning("Tópico MQTT do RPA não reconhecido: %s", mensagem.topic)
    except (DatabaseError, redis.exceptions.RedisError):
        logger.exception("Falha ao processar mensagem MQTT do RPA; reconectando para permitir reentrega.")
        cliente.disconnect()
        return

    _confirmar_mensagem(cliente, mensagem)


def ouvir_mqtt_rpa():
    host = os.getenv("MQTT_HOST", os.getenv("RABBITMQ_HOST", "rabbitmq"))
    port = int(os.getenv("MQTT_PORT", "1883"))
    username = os.getenv("MQTT_USER", os.getenv("RABBITMQ_USER", "guest"))
    password = os.getenv("MQTT_PASSWORD", os.getenv("RABBITMQ_PASSWORD", "guest"))
    client_id = os.getenv("MQTT_CLIENT_ID", "smartcard-rpa-consumer")

    while True:
        cliente = mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
            client_id=client_id,
            clean_session=False,
            manual_ack=True,
        )
        cliente.username_pw_set(username, password)
        cliente.on_connect = _ao_conectar
        cliente.on_message = _ao_receber_mensagem
        cliente.disable_logger()
        logger.info("Tentando conectar ao RabbitMQ MQTT do RPA em %s:%d...", host, port)
        try:
            cliente.connect(host, port, keepalive=60)
            cliente.loop_forever()
        except (mqtt.MQTTException, OSError) as erro:
            logger.error("Erro ao receber mensagens MQTT do RPA: %r", erro)
        finally:
            if cliente.is_connected():
                cliente.disconnect()
                logger.info("Desconectado do RabbitMQ MQTT do RPA. Tentando reconectar em 5 segundos...")
        time.sleep(5)
        

consumer_thread = threading.Thread(target=ouvir_mqtt_rpa, daemon=True)
consumer_thread.start()