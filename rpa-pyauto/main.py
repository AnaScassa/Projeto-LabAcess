from threading import Thread, Event
import pika
from publisher import enviar_mensagem
from desktop import entrarSes, excluir_csvs
from csv_utils import obter_ultimos_csvs, enviar_arquivo_rabbit
import time
import pyautogui

executar_agora = Event() 

def executar_rpa():
    try:
        print("Iniciando RPA...")
        
        entrarSes()

        arquivos, total_linhas = obter_ultimos_csvs(quantidade=3)

        for arquivo in arquivos:
            enviar_arquivo_rabbit(arquivo)

        enviar_mensagem({"status": "ok", "total_linhas": total_linhas}, "buscar_concluido")

        excluir_csvs()

        print("RPA finalizado.")

    except Exception as e:
        print(f"Erro: {e}")


def callback(ch, method, properties, body):
    print("Mensagem recebida na fila buscar")
    executar_agora.set()


def ouvir_fila():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="143.106.5.41", port=5672))
    channel = connection.channel()
    channel.queue_declare(queue="buscar", durable=True)
    channel.basic_consume(queue="buscar", on_message_callback=callback, auto_ack=True)

    print("Ouvindo fila buscar...")
    channel.start_consuming()


def main():

    Thread(target=ouvir_fila, daemon=True).start()

    while True:
        executar_rpa()
        print("Aguardando próxima execução...")
        
        executar_agora.wait(timeout=300) 
        executar_agora.clear()


if __name__ == "__main__":
    main()