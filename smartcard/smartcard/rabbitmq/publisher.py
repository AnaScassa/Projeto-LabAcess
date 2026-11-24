import json
import os
import time
import uuid

import paho.mqtt.client as mqtt

_TOPICOS = {
    "buscar": "smartcard/rpa/buscar",
    "reiniciar_rpa": "smartcard/rpa/reiniciar",
}


def enviar_mensagem(queue_name, mensagem):
    try:
        topico = _TOPICOS[queue_name]
    except KeyError as erro:
        raise ValueError(f"Canal MQTT do SmartCard desconhecido: {queue_name}") from erro

    cliente = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, client_id=f"smartcard-rpa-publisher-{uuid.uuid4().hex}")
    cliente.username_pw_set(os.getenv("MQTT_USER", os.getenv("RABBITMQ_USER", "guest")), os.getenv("MQTT_PASSWORD", os.getenv("RABBITMQ_PASSWORD", "guest")))

    conectado = False
    try:
        cliente.connect(os.getenv("MQTT_HOST", os.getenv("RABBITMQ_HOST", "rabbitmq")), int(os.getenv("MQTT_PORT", "1883")), keepalive=60)
        cliente.loop_start()
        conectado = True

        prazo = time.monotonic() + 10
        while not cliente.is_connected() and time.monotonic() < prazo:
            time.sleep(0.05)
        if not cliente.is_connected():
            raise TimeoutError("O SmartCard não conseguiu conectar ao RabbitMQ MQTT.")

        info = cliente.publish(topico, json.dumps(mensagem, ensure_ascii=False, default=str), qos=1, retain=False)
        if info.rc != mqtt.MQTT_ERR_SUCCESS:
            raise ConnectionError(f"Falha ao publicar no tópico MQTT {topico}: código {info.rc}")

        info.wait_for_publish(timeout=10)
        if not info.is_published():
            raise TimeoutError(f"RabbitMQ não confirmou a publicação no tópico {topico}.")
    finally:
        if conectado:
            cliente.disconnect()
            cliente.loop_stop()