import csv
import json
import os
import base64
import pika
import static
from jsonFormatter import logger
from config import RABBITMQ_HOST, RABBITMQ_PASSWORD, RABBITMQ_PORT, RABBITMQ_USER

def obter_ultimos_csvs(quantidade=3):

    try:
        csvs = [
            os.path.join(static.PASTA, arquivo)
            for arquivo in os.listdir(static.PASTA)
            if arquivo.lower().endswith(".csv")
        ]

        if not csvs:
            raise FileNotFoundError(f"Nenhum arquivo CSV encontrado em {static.PASTA}")

        csvs_ordenados = sorted(csvs, key=os.path.getmtime, reverse=True)
        ultimos = csvs_ordenados[:quantidade]
        logger.info(f"Encontrados {len(ultimos)} arquivos CSV mais recentes")
        total_linhas = contar_linhas_csv()

        return ultimos, total_linhas

    except Exception as e:
        logger.error(f"Erro ao obter arquivos CSV: {e}")
        return [], 0
    
def contar_linhas_csv():
    total_linhas = 0

    try:
        for nome_arquivo in os.listdir(static.PASTA):
            if nome_arquivo.lower().endswith(".csv"):
                caminho_arquivo = os.path.join(static.PASTA, nome_arquivo)

                with open(caminho_arquivo, "r", encoding="latin-1") as arquivo_csv:
                    leitor = csv.reader(arquivo_csv, delimiter=";")

                    next(leitor, None)

                    linhas = sum(1 for _ in leitor)

                    total_linhas += linhas

                    logger.info(f"{nome_arquivo}: {linhas} registros")

        logger.info(f"Total de registros: {total_linhas}")

        return total_linhas

    except Exception as e:
        logger.error(f"Erro ao contar linhas dos CSVs: {e}")
        return 0
    
def enviar_arquivo_rabbit(arquivo):
    
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    channel.queue_declare(queue="csvs", durable=True)

    with open(arquivo, "rb") as f:
        conteudo = base64.b64encode(f.read()).decode("utf-8")

    mensagem = {
        "nome": os.path.basename(arquivo),
        "conteudo": conteudo
    }

    channel.basic_publish(exchange="", routing_key="csvs", body=json.dumps(mensagem),
        properties=pika.BasicProperties(delivery_mode=pika.DeliveryMode.Persistent),
    )
    
    connection.close()