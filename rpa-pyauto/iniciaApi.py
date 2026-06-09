import pika
import json
import traceback
from main import main
from jsonFormatter import logger
from task_manager import TaskManager
from config import RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASSWORD, RABBITMQ_QUEUE, exibir_config

def consumir_rpa():
    try:
        # Exibir configurações
        exibir_config()
        
        # Inicializar gerenciador de tarefas
        TaskManager.inicializar()
        
        # Conectar ao RabbitMQ
        logger.info(f"Conectando ao RabbitMQ em {RABBITMQ_HOST}:{RABBITMQ_PORT}")
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT,
                credentials=pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD),
                connection_attempts=3,
                retry_delay=2
            )
        )
        channel = connection.channel()
        
        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
        
        channel.basic_qos(prefetch_count=1)
        
        logger.info("Aguardando mensagens do RabbitMQ...")
        
        def callback(ch, method, properties, body):
            try:
                msg = json.loads(body)
                task_id = msg.get('task_id', 'sem_id')
                user_id = msg.get('user_id', 'desconhecido')
                timestamp = msg.get('timestamp', '')
                
                logger.info(f"=== RPA iniciado ===")
                logger.info(f"Task ID: {task_id}")
                logger.info(f"User ID: {user_id}")
                logger.info(f"Dados: {msg}")
                
                # Registrar tarefa como iniciada
                TaskManager.registrar_tarefa(task_id, user_id, timestamp)
                
                # Executar o RPA
                main()
                
                # Marcar como concluída
                ch.basic_ack(delivery_tag=method.delivery_tag)
                TaskManager.marcar_como_concluida(task_id)
                logger.info(f"Task {task_id} concluída com sucesso")
                
            except json.JSONDecodeError:
                logger.error("Erro ao decodificar JSON da mensagem")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
                
            except Exception as e:
                logger.error(f"Erro ao executar RPA: {e}")
                logger.error(traceback.format_exc())
                task_id = msg.get('task_id', 'desconhecido') if 'msg' in locals() else 'desconhecido'
                TaskManager.marcar_como_erro(task_id, str(e))
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        
        channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=callback)
        channel.start_consuming()
        
    except pika.exceptions.AMQPConnectionError:
        logger.error("Erro: Não conseguiu conectar ao RabbitMQ. Certifique-se que está rodando em 'rabbitmq'")
    except KeyboardInterrupt:
        logger.info("Consumer interrompido pelo usuário")
    except Exception as e:
        logger.error(f"Erro geral no consumer: {e}")
        logger.error(traceback.format_exc())

if __name__ == '__main__':
    consumir_rpa()