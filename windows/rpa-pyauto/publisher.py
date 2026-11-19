import json
from threading import Event, Lock

import paho.mqtt.client as mqtt

from config import (
    MQTT_CLIENT_ID,
    MQTT_HOST,
    MQTT_PASSWORD,
    MQTT_PORT,
    MQTT_USER,
)

_TOPICOS = {
    "buscar_concluido": "smartcard/rpa/status",
    "rpa_heartbeat": "smartcard/rpa/heartbeat",
    "rpa_erros": "smartcard/rpa/errors",
}
_QOS = {"rpa_heartbeat": 0}
_CLIENT_ID = f"{MQTT_CLIENT_ID}-publisher"
_lock_cliente = Lock()
_conectado = Event()
_cliente = None


def _ao_conectar(cliente, userdata, flags, reason_code, properties):
    if reason_code.is_failure:
        _conectado.clear()
        return
    _conectado.set()


def _ao_desconectar(cliente, userdata, disconnect_flags, reason_code, properties):
    _conectado.clear()


def _obter_cliente():
    global _cliente

    with _lock_cliente:
        if _cliente is None:
            cliente = mqtt.Client(
                callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
                client_id=_CLIENT_ID,
            )
            cliente.username_pw_set(MQTT_USER, MQTT_PASSWORD)
            cliente.on_connect = _ao_conectar
            cliente.on_disconnect = _ao_desconectar
            cliente.connect(MQTT_HOST, MQTT_PORT, keepalive=60)
            cliente.loop_start()
            _cliente = cliente

        return _cliente


def enviar_mensagem(mensagem, queue_name) -> bool:
    try:
        topico = _TOPICOS[queue_name]
    except KeyError as erro:
        raise ValueError(f"Canal MQTT do RPA desconhecido: {queue_name}") from erro

    cliente = _obter_cliente()
    if not _conectado.wait(timeout=10):
        raise TimeoutError("O RPA não conseguiu conectar ao RabbitMQ MQTT.")

    info = cliente.publish(
        topico,
        json.dumps(mensagem, ensure_ascii=False, default=str),
        qos=_QOS.get(queue_name, 1),
        retain=False,
    )
    if info.rc != mqtt.MQTT_ERR_SUCCESS:
        raise ConnectionError(f"Falha ao publicar no tópico MQTT {topico}: código {info.rc}")

    info.wait_for_publish(timeout=10)
    if not info.is_published():
        raise TimeoutError(f"RabbitMQ não confirmou a publicação no tópico {topico}.")

    return True