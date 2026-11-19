import json
import os
import subprocess
import time
from datetime import datetime, time as datetime_time, timezone
from pathlib import Path
import pyautogui
from apscheduler.schedulers.background import BackgroundScheduler
from threading import Thread, Lock
from jsonFormatter import logger
from publisher import enviar_mensagem
from desktop import entrarSes, verificar_ses
from csv_utils import obter_ultimos_csvs, enviar_arquivo_rabbit
from buscar_registro import fila_busca, ouvir_fila

INTERVALO_INICIAL_MINUTOS = 5
INTERVALO_MAXIMO_MINUTOS = 20
INTERVALO_INCREMENTO_MINUTOS = 5
JANELA_REINICIO_INICIO = datetime_time(3, 0)
JANELA_REINICIO_FIM = datetime_time(3, 30)
JANELA_BUSCA_APOS_REINICIO_MINUTOS = 50
ARQUIVO_ESTADO_RPA = Path(__file__).with_name(".rpa_state.json")


def carregar_estado_rpa():
    try:
        with ARQUIVO_ESTADO_RPA.open("r", encoding="utf-8") as arquivo:
            estado = json.load(arquivo)
    except FileNotFoundError:
        return {"ultimo_reinicio": None, "busca_50_min_pendente": False}

    if not isinstance(estado, dict):
        raise ValueError("O arquivo de estado do RPA deve conter um objeto JSON.")

    return {
        "ultimo_reinicio": estado.get("ultimo_reinicio"),
        "busca_50_min_pendente": estado.get("busca_50_min_pendente", False),
    }


def salvar_estado_rpa():
    arquivo_temporario = ARQUIVO_ESTADO_RPA.with_name(ARQUIVO_ESTADO_RPA.name + ".tmp")
    with arquivo_temporario.open("w", encoding="utf-8") as arquivo:
        json.dump(estado_rpa, arquivo)
        arquivo.flush()
        os.fsync(arquivo.fileno())
    os.replace(arquivo_temporario, ARQUIVO_ESTADO_RPA)


def reiniciar_se_necessario(agora):
    logger.info("Checagem de reinício: horário local %s; último reinício registrado: %s", agora.strftime("%Y-%m-%d %H:%M:%S"), estado_rpa["ultimo_reinicio"])

    if not JANELA_REINICIO_INICIO <= agora.time() < JANELA_REINICIO_FIM:
        logger.info("Reinício ignorado: fora da janela 03:00-03:30.")
        return False

    hoje = agora.date().isoformat()
    if estado_rpa["ultimo_reinicio"] == hoje:
        logger.info("Reinício ignorado: já foi solicitado hoje.")
        return False

    estado_anterior = estado_rpa.copy()
    estado_rpa["ultimo_reinicio"] = hoje
    estado_rpa["busca_50_min_pendente"] = True
    try:
        salvar_estado_rpa()
        shutdown_exe = Path(os.environ.get("SystemRoot", r"C:\Windows")) / "System32" / "shutdown.exe"
        logger.warning("Solicitando reinício do Windows em %s.", shutdown_exe)
        subprocess.run([str(shutdown_exe), "/r", "/t", "1"], check=True, timeout=10, capture_output=True, text=True)
    except (OSError, subprocess.SubprocessError) as erro:
        if isinstance(erro, subprocess.CalledProcessError):
            logger.error("shutdown.exe falhou (código %s): %s", erro.returncode, erro.stderr or erro.stdout)
        else:
            logger.exception("Falha ao executar shutdown.exe.")
        estado_rpa.clear()
        estado_rpa.update(estado_anterior)
        salvar_estado_rpa()
        raise

    logger.info("Reinício diário solicitado; a próxima busca automática usará 50 minutos.")
    return True

execucao_em_andamento = Lock()

scheduler = None
scheduled_job = None
primeira_execucao = True
intervalo_progressivo_minutos = INTERVALO_INICIAL_MINUTOS
execucoes_sem_csv = 0
estado_rpa = carregar_estado_rpa()

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

    if not execucao_em_andamento.acquire(blocking=False):
        print("RPA já está em execução.")
        return

    encontrou_csv = None

    try:
        if motivo == "Agendamento" and reiniciar_se_necessario(datetime.now()):
            return

        if primeira_execucao:
            pyautogui.click(1244, 178)
            time.sleep(2)
            pyautogui.click(1148, 123)
            time.sleep(2)
            primeira_execucao = False

        print(f"\n========== INICIANDO RPA ({motivo}) ==========")

        verificar_ses()
        time.sleep(2)
        busca_apos_reinicio = (motivo == "Agendamento" and dados_busca is None and estado_rpa["busca_50_min_pendente"])
        janela_busca_minutos = (JANELA_BUSCA_APOS_REINICIO_MINUTOS if busca_apos_reinicio else None)
        busca_iniciada = entrarSes(dados_busca, intervalo_progressivo_minutos=intervalo_progressivo_minutos, janela_busca_minutos=janela_busca_minutos)
        if busca_apos_reinicio and busca_iniciada:
            estado_rpa["busca_50_min_pendente"] = False
            try:
                salvar_estado_rpa()
            except OSError:
                estado_rpa["busca_50_min_pendente"] = True
                raise

        time.sleep(3)
        arquivos, total_linhas = obter_ultimos_csvs()
        encontrou_csv = bool(arquivos)

        if not arquivos:
            enviar_mensagem({"status": "nenhum arquivo foi enviado", "total_linhas": None}, "buscar_concluido")

        for arquivo in arquivos:
            try:
                enviar_arquivo_rabbit(arquivo)
            except Exception as e:
                logger.error("Erro ao enviar arquivo %s para o RabbitMQ: %s", arquivo, e)
                continue

            time.sleep(2)
            try:
                os.remove(arquivo)
                logger.info("Arquivo excluído após envio confirmado: %s", arquivo)
            except OSError as e:
                logger.error("Arquivo enviado, mas não foi possível excluí-lo (%s): %s", arquivo, e)

        enviar_mensagem({"status": "finalizado", "total_linhas": total_linhas}, "buscar_concluido")
        time.sleep(2)

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


def process_queue():
    print("Thread process_queue iniciada.")

    while True:
        print("Esperando mensagem...")

        mensagem = fila_busca.get()

        print("Mensagem retirada da fila:", mensagem)

        try:
            executar_rpa("MQTT", mensagem)
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
    logger.info("Inicializando RPA: script=%s; arquivo de estado=%s", Path(__file__).resolve(), ARQUIVO_ESTADO_RPA.resolve())
    agendar_execucoes()

    thread_fila = Thread(target=ouvir_fila, daemon=True)
    thread_processamento = Thread(target=process_queue, daemon=True)
    thread_heartbeat = Thread(target=publicar_heartbeat, daemon=True)

    thread_fila.start()
    print("Thread MQTT iniciada.")

    thread_processamento.start()
    print("Thread process_queue iniciada.")

    thread_heartbeat.start()
    print("Thread de heartbeat do RPA iniciada.")

    while True:
        time.sleep(2)


if __name__ == "__main__":
    main()