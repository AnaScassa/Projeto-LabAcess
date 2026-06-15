import json
import os
import base64
import pika
from jsonFormatter import logger

def obter_ultimos_csvs(quantidade=3):
    pasta = r"C:\Sualtech\SESClient"

    try:
        csvs = [
            os.path.join(pasta, arquivo)
            for arquivo in os.listdir(pasta)
            if arquivo.lower().endswith(".csv")
        ]

        if not csvs:
            raise FileNotFoundError(
                f"Nenhum arquivo CSV encontrado em {pasta}"
            )

        csvs_ordenados = sorted(csvs, key=os.path.getmtime, reverse=True)

        ultimos = csvs_ordenados[:quantidade]

        logger.info(f"Encontrados {len(ultimos)} arquivos CSV mais recentes")

        for arquivo in ultimos:
            logger.info(f" - {os.path.basename(arquivo)}")

        return ultimos

    except Exception as e:
        logger.error(f"Erro ao obter arquivos CSV: {e}")
        return []
    
def enviar_arquivo_rabbit(arquivo):
    
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="143.106.5.41", port=5672))
    channel = connection.channel()
    channel.queue_declare(queue="csvs")

    with open(arquivo, "rb") as f:
        conteudo = base64.b64encode(f.read()).decode("utf-8")

    mensagem = {
        "nome": os.path.basename(arquivo),
        "conteudo": conteudo
    }

    channel.basic_publish(exchange="", routing_key="csvs", body=json.dumps(mensagem))
    print(f"Arquivo enviado: {mensagem['nome']}")
    connection.close()