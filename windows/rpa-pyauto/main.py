import json
import time
from datetime import datetime, timezone
import pyautogui
from apscheduler.schedulers.background import BackgroundScheduler
from threading import Thread, Lock
from jsonFormatter import logger
from publisher import enviar_mensagem
from desktop import entrarSes, excluir_csvs, verificar_ses
from csv_utils import obter_ultimos_csvs, enviar_arquivo_rabbit
from buscar_registro import fila_busca, ouvir_fila

INTERVALO_INICIAL_MINUTOS = 5
INTERVALO_MAXIMO_MINUTOS = 20
INTERVALO_INCREMENTO_MINUTOS = 5

execucao_em_andamento = Lock()

scheduler = None
scheduled_job = None
primeira_execucao = True
intervalo_progressivo_minutos = INTERVALO_INICIAL_MINUTOS
execucoes_sem_csv = 0

def atualizar_intervalo_agendamento(encontrou_csv):
    global intervalo_progressivo_minutos
    global execucoes_sem_csv

    if encontrou_csv is True:
        proximo_intervalo = INTERVALO_INICIAL_MINUTOS
        intervalo_progressivo_minutos = INTERVALO_INICIAL_MINUTOS
        execucoes_sem_csv = 0
    else:
        if encontrou_csv is False:
            execucoes_sem_csv = min(execucoes_sem_csv + 1, INTERVALO_MAXIMO_MINUTOS // INTERVALO_INCREMENTO_MINUTOS)
            intervalo_progressivo_minutos = min(execucoes_sem_csv * INTERVALO_INCREMENTO_MINUTOS, INTERVALO_MAXIMO_MINUTOS)
        proximo_intervalo = intervalo_progressivo_minutos

    if scheduler is not None and scheduled_job is not None:
        scheduler.reschedule_job(scheduled_job.id, trigger="interval", minutes=proximo_intervalo)
        logger.info("Próxima execução do RPA agendada para daqui a %s minutos", proximo_intervalo)

def executar_rpa(motivo="agendamento", dados_busca=None):
    global primeira_execucao

    if primeira_execucao:
        pyautogui.click(1244, 178)
        time.sleep(2)
        pyautogui.click(1148, 123)
        time.sleep(2)
        primeira_execucao = False

    if not execucao_em_andamento.acquire(blocking=False):
        print("RPA já está em execução.")
        return

    encontrou_csv = None

    try:
        print(f"\n========== INICIANDO RPA ({motivo}) ==========")

        verificar_ses()
        time.sleep(2)
        entrarSes(dados_busca, intervalo_progressivo_minutos=intervalo_progressivo_minutos)
        time.sleep(3)
        arquivos, total_linhas = obter_ultimos_csvs(quantidade=3)
        encontrou_csv = bool(arquivos)

        for arquivo in arquivos:
            enviar_arquivo_rabbit(arquivo)
            time.sleep(2)
            if arquivo is None:
                enviar_mensagem({"status": "nenhum arquivo foi enviado", "total_linhas": None}, "buscar_concluido")

        enviar_mensagem({"status": "finalizado", "total_linhas": total_linhas}, "buscar_concluido")
        time.sleep(2)

        excluir_csvs()

        print("========== RPA FINALIZADO ==========\n")

    except Exception as e:
        logger.error("Erro durante execução: %s", e)

    finally:
        try:
            atualizar_intervalo_agendamento(encontrou_csv)
        except Exception as erro:
            logger.error("Erro ao atualizar intervalo do agendamento: %s", erro)
        finally:
            execucao_em_andamento.release()


def callback(ch, method, properties, body):
    mensagem = json.loads(body.decode())

    print("Mensagem recebida:", mensagem)

    fila_busca.put(mensagem)

    ch.basic_ack(method.delivery_tag)

def process_queue():
    print("Thread process_queue iniciada.")

    while True:
        print("Esperando mensagem...")

        mensagem = fila_busca.get()

        print("Mensagem retirada da fila:", mensagem)

        try:
            executar_rpa("RabbitMQ", mensagem)
        finally:
            fila_busca.task_done()

def publicar_heartbeat():
    while True:
        try:
            enviar_mensagem({"enviado_em": datetime.now(timezone.utc).isoformat()}, "rpa_heartbeat")
        except Exception as erro:
            logger.error("Não foi possível enviar heartbeat do RPA: %r", erro)
        time.sleep(25)

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
    thread_heartbeat = Thread(target=publicar_heartbeat, daemon=True)

    thread_fila.start()
    print("Thread Rabbit iniciada.")

    thread_processamento.start()
    print("Thread process_queue iniciada.")

    thread_heartbeat.start()
    print("Thread de heartbeat do RPA iniciada.")

    while True:
        time.sleep(2)


if __name__ == "__main__":
    main()