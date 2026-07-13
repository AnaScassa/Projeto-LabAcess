from threading import Thread, Lock
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import json
import pika
import time

from publisher import enviar_mensagem
from desktop import entrarSes, excluir_csvs
from csv_utils import obter_ultimos_csvs, enviar_arquivo_rabbit
from buscar_registro import fila_busca

execucao_em_andamento = Lock()

scheduler = None
scheduled_job = None


def executar_rpa(motivo="agendamento"):
    global scheduled_job

    if not execucao_em_andamento.acquire(blocking=False):
        print("RPA já está em execução.")
        return

    try:
        print(f"\n========== INICIANDO RPA ({motivo}) ==========")

        entrarSes()

        arquivos, total_linhas = obter_ultimos_csvs(quantidade=3)

        for arquivo in arquivos:
            enviar_arquivo_rabbit(arquivo)

        enviar_mensagem(
            {
                "status": "ok",
                "total_linhas": total_linhas
            },
            "buscar_concluido"
        )

        excluir_csvs()

        print("========== RPA FINALIZADO ==========\n")

    except Exception as e:
        print("Erro durante execução:", e)

    finally:
        execucao_em_andamento.release()

        if scheduled_job:
            scheduled_job.modify(
                next_run_time=datetime.now() + timedelta(minutes=5)
            )


def callback(ch, method, properties, body):
    mensagem = json.loads(body.decode())

    print("Mensagem recebida:", mensagem)

    fila_busca.put(mensagem)

    ch.basic_ack(method.delivery_tag)

def ouvir_fila():
    print("Conectando RabbitMQ...")

    connection = pika.BlockingConnection(pika.ConnectionParameters(host="143.106.5.41", port=5672))
    channel = connection.channel()
    channel.queue_declare(queue="buscar", durable=True)
    channel.basic_consume(queue="buscar", on_message_callback=callback, auto_ack=False)

    print("RabbitMQ aguardando mensagens...")

    channel.start_consuming()

def process_queue():
    print("Thread process_queue iniciada.")

    while True:
        print("Esperando mensagem...")

        mensagem = fila_busca.get()

        print("Mensagem retirada da fila:", mensagem)

        try:
            executar_rpa("RabbitMQ")
        finally:
            fila_busca.task_done()


def agendar_execucoes():
    global scheduler
    global scheduled_job

    scheduler = BackgroundScheduler()
    scheduled_job = scheduler.add_job(lambda: executar_rpa("Agendamento"), trigger="interval", minutes=5, id="rpa_job")
    scheduler.start()
    return scheduler

def main():
    print("Iniciando sistema...")

    agendar_execucoes()

    thread_fila = Thread(target=ouvir_fila, daemon=True)
    thread_processamento = Thread(target=process_queue, daemon=True)

    thread_fila.start()
    print("Thread Rabbit iniciada.")

    thread_processamento.start()
    print("Thread process_queue iniciada.")

    while True:
        time.sleep(1)


if __name__ == "__main__":
    main()