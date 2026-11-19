import os
from pathlib import Path
from dotenv import load_dotenv
from jsonFormatter import logger

load_dotenv(Path(__file__).with_name('.env'))

def carregar_secrets_infisical():
    logger.info("Usando variáveis de ambiente para configuração")
    return None

INFISICAL_CLIENT = carregar_secrets_infisical()

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
MQTT_HOST = os.getenv('MQTT_HOST', RABBITMQ_HOST)
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
MQTT_USER = os.getenv('MQTT_USER', RABBITMQ_USER)
MQTT_PASSWORD = os.getenv('MQTT_PASSWORD', RABBITMQ_PASSWORD)
MQTT_CLIENT_ID = os.getenv('MQTT_CLIENT_ID', 'rpa-sesclient')

FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.getenv('FLASK_PORT', 8006))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
TASKS_FILE = os.getenv('TASKS_FILE', 'tasks_status.json')

def exibir_config():
    """Exibe configurações ativas"""
    print("\n" + "=" * 60)
    print("CONFIGURAÇÕES RPA")
    print("=" * 60)
    print(f"\n🔌 RabbitMQ AMQP (arquivos):")
    print(f"   Host: {RABBITMQ_HOST}")
    print(f"   Porta: {RABBITMQ_PORT}")
    print(f"   Usuário: {RABBITMQ_USER}")
    print(f"\n📨 RabbitMQ MQTT (comandos e status):")
    print(f"   Host: {MQTT_HOST}")
    print(f"   Porta: {MQTT_PORT}")
    
    print(f"\n🌐 Flask:")
    print(f"   Host: {FLASK_HOST}")
    print(f"   Porta: {FLASK_PORT}")
    print(f"   Debug: {FLASK_DEBUG}")
    
    print(f"\n📁 Geral:")
    print(f"   Arquivo de tarefas: {TASKS_FILE}")
    print(f"   Nível de log: {LOG_LEVEL}")
    print("\n" + "=" * 60 + "\n")