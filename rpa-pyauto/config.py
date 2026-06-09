import os
from dotenv import load_dotenv
from jsonFormatter import logger
from infisical import InfisicalClient

load_dotenv()

def carregar_secrets_infisical():
    try:
        client = InfisicalClient(
            client_id=os.getenv("INFISICAL_CLIENT_ID"),
            client_secret=os.getenv("INFISICAL_CLIENT_SECRET")
        )
    
        logger.info("Conectado ao Infisical")
        return client
        
    except Exception as e:
        logger.warning(f"Erro ao conectar Infisical: {e}")
        return None

INFISICAL_CLIENT = carregar_secrets_infisical()

# ========================
# CONFIGURAÇÕES RabbitMQ
# ========================
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'rpa_executar')

# ========================
# CONFIGURAÇÕES Flask
# ========================
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.getenv('FLASK_PORT', 8006))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# ========================
# CONFIGURAÇÕES GERAIS
# ========================
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
TASKS_FILE = os.getenv('TASKS_FILE', 'tasks_status.json')

# ========================
# EXIBIR CONFIGURAÇÕES
# ========================
def exibir_config():
    """Exibe configurações ativas"""
    print("\n" + "=" * 60)
    print("CONFIGURAÇÕES RPA")
    print("=" * 60)
    print(f"\n🔌 RabbitMQ:")
    print(f"   Host: {RABBITMQ_HOST}")
    print(f"   Porta: {RABBITMQ_PORT}")
    print(f"   Usuário: {RABBITMQ_USER}")
    print(f"   Fila: {RABBITMQ_QUEUE}")
    
    print(f"\n🌐 Flask:")
    print(f"   Host: {FLASK_HOST}")
    print(f"   Porta: {FLASK_PORT}")
    print(f"   Debug: {FLASK_DEBUG}")
    
    print(f"\n📁 Geral:")
    print(f"   Arquivo de tarefas: {TASKS_FILE}")
    print(f"   Nível de log: {LOG_LEVEL}")
    print("\n" + "=" * 60 + "\n")
