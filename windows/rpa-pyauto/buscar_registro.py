import json
from queue import Queue
import paho.mqtt.client as mqtt

from jsonFormatter import logger
from config import MQTT_CLIENT_ID, MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USER

fila_busca = Queue()
TOPICO_BUSCA = "smartcard/rpa/buscar"
TOPICO_REINICIAR = "smartcard/rpa/reiniciar"


def _ao_conectar(cliente, userdata, flags, reason_code, properties):
    if reason_code.is_failure:
        logger.error("RabbitMQ MQTT recusou a conexão do RPA: %s", reason_code)
        return

    topicos = [(TOPICO_BUSCA, 1), (TOPICO_REINICIAR, 1)]
    resultado, _ = cliente.subscribe(topicos)
    if resultado != mqtt.MQTT_ERR_SUCCESS:
        logger.error("Não foi possível assinar os tópicos MQTT do RPA: código %s", resultado)
        return

    logger.info( "RPA conectado ao RabbitMQ MQTT em %s:%s; aguardando confirmação das assinaturas %s.", MQTT_HOST, MQTT_PORT, [topico for topico, _ in topicos])


def _ao_assinar(cliente, userdata, mid, reason_codes, properties):
    if any(reason_code.is_failure for reason_code in reason_codes):
        logger.error( "RabbitMQ MQTT recusou uma assinatura dos tópicos %s: %s", [TOPICO_BUSCA, TOPICO_REINICIAR], reason_codes)
        return

    logger.info( "RabbitMQ MQTT confirmou as assinaturas do RPA nos tópicos %s (QoS concedido: %s).", [TOPICO_BUSCA, TOPICO_REINICIAR], reason_codes)


def _ao_desconectar(cliente, userdata, disconnect_flags, reason_code, properties):
    if reason_code.is_failure:
        logger.warning("RPA desconectado do RabbitMQ MQTT: %s", reason_code)


def _ao_receber_mensagem(cliente, userdata, mensagem):
    try:
        dados = json.loads(mensagem.payload.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as erro:
        logger.error("Mensagem MQTT inválida recebida no tópico %s: %s", mensagem.topic, erro)
        return

    if not isinstance(dados, dict):
        logger.error("A mensagem MQTT do tópico %s deve ser um objeto JSON.", mensagem.topic)
        return

    if mensagem.topic == TOPICO_REINICIAR:
        fila_busca.put({"_comando": "reiniciar_rpa", "user_id": dados.get("user_id")})
        logger.warning("Solicitação MQTT de reinício do RPA recebida (user_id=%s).", dados.get("user_id"))
        return

    fila_busca.put(dados)
    logger.info("Comando MQTT válido recebido e enfileirado: tópico=%s, campos=%s.", mensagem.topic, sorted(dados.keys()))


def ouvir_fila():
    cliente = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, client_id=MQTT_CLIENT_ID, clean_session=False)
    cliente.username_pw_set(MQTT_USER, MQTT_PASSWORD)
    cliente.on_connect = _ao_conectar
    cliente.on_subscribe = _ao_assinar
    cliente.on_disconnect = _ao_desconectar
    cliente.on_message = _ao_receber_mensagem
    cliente.connect_async(MQTT_HOST, MQTT_PORT, keepalive=60)
    cliente.loop_forever(retry_first_connection=True)