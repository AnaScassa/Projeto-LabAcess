import os
import requests
from jsonFormatter import logger
from dotenv import load_dotenv

load_dotenv()

INFISICAL_TOKEN = os.getenv("INFISICAL_TOKEN")
INFISICAL_PROJECT_ID = os.getenv("INFISICAL_PROJECT_ID")
INFISICAL_ENVIRONMENT = "dev"

import subprocess
import json

def obter_secret(nome_secret):
    resultado = subprocess.run(["infisical", "secrets", "get", nome_secret, "--token", INFISICAL_TOKEN, "-o", "json"],
        capture_output=True,
        text=True,
        encoding="utf-8"
    )

    if resultado.returncode != 0:
        raise Exception(f"Erro ao buscar secret: {resultado.stderr}")

    dados = json.loads(resultado.stdout)

    logger.info(f"DADOS INFISICAL: {dados}")

    return dados[0]["secretValue"]

def obter_token_jwt():
    refresh = obter_secret("refresh")

    response = requests.post("http://ccspc-041.ccs.unicamp.br:8001/api/users/api/token/refresh/",
        json={
            "refresh": refresh
        }
    )

    if response.status_code != 200:
        raise Exception(f"Erro ao renovar token: {response.text}")

    return response.json()["access"]

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


def enviar_arquivo_api(caminho_arquivo):
    url = "http://ccspc-041.ccs.unicamp.br:8000/api/acesso/upload-xls/"

    try:
        authorization_token = obter_token_jwt()

        headers = {
            "Authorization": f"Bearer {authorization_token}"
        }

        with open(caminho_arquivo, "rb") as arquivo:
            files = {
                "file": (os.path.basename(caminho_arquivo), arquivo, "text/csv")
            }

            response = requests.post(url, headers=headers, files=files)

        logger.info(f"Arquivo enviado: {caminho_arquivo}")
        logger.info(f"Status: {response.status_code}")
        logger.info(f"Resposta: {response.text}")

        if response.status_code in [200, 201, 202]:
            logger.info("Arquivo enviado com sucesso")

            if response.status_code == 202:
                try:
                    data = response.json()
                    logger.info(f"Task ID: {data.get('task_id')}")
                except Exception:
                    pass

        else:
            logger.error(f"Erro ao enviar arquivo. Status: {response.status_code}")

    except Exception as e:
        logger.error(f"Erro ao enviar arquivo: {e}")