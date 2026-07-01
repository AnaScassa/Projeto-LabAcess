from datetime import date
import tempfile

from django.core.cache import cache
from django.utils import timezone
from django.core.mail import get_connection, send_mail
from django.conf import settings

from celery import shared_task, shared_task

from .services import vincular_por_matricula
from .models import Processamento, Usuario, Acesso
from fuzzywuzzy import fuzz
from dotenv import load_dotenv
import smtplib
import uuid
import pandas as pd
import time
import threading
import pika
import json
import base64
import os

load_dotenv()

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

@shared_task(bind=True, queue="fila_rapida")
def processar_xls(self, caminho_arquivo, task_id):

    corr_id = str(task_id)
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
    channel = connection.channel()
    result = channel.queue_declare(queue='', exclusive=True)
    callback_queue = result.method.queue
    resposta = None

    def on_response(ch, method, props, body):
        nonlocal resposta

        print("Mensagem recebida!")

        if props.correlation_id == corr_id:
            resposta = json.loads(body)
            print("Resposta válida recebida!")

    channel.basic_consume(queue=callback_queue, on_message_callback=on_response, auto_ack=True)

    channel.basic_publish(exchange='', routing_key='usuarios_processados', properties=pika.BasicProperties(reply_to=callback_queue, correlation_id=corr_id,),
        body=json.dumps({
            "task_id": task_id
        }))

    timeout = 30
    inicio = time.time()

    while resposta is None:
        connection.process_data_events(time_limit=1)
        if time.time() - inicio > timeout:
            break

    print("RESPOSTA:", resposta)
    connection.close()

    if resposta is None:
        raise Exception("Timeout esperando users_service")

    dados = cache.get(f"users_global_{task_id}")

    if not dados:
        print("CACHE NÃO ENCONTRADO")
        return False

    profiles = dados["profiles"]
    users = dados["users"]
    
    print("Dados recebidos!")
    print(f"USERS: {len(users)}")
    print(f"PROFILES: {len(profiles)}")

    df = pd.read_excel(caminho_arquivo)

    for _, row in df.iterrows():
        matricula = str(row.get("MATRICULA", "")).strip()
        desc_evento = row.get("DESC_EVENTO", "")
        apontamento = 0 if desc_evento == "Apontamento Normal" else 1
        
        if "NOME_ALUNO" in df.columns:
            hora_dt = pd.to_datetime(str(row["HORA"]).strip(), format="%Y-%m-%d %H:%M:%S")
            ent_sai = str(row.get("ENT_SAI", "")).strip()

            if ent_sai == "1" and (hora_dt.hour >= 18 or hora_dt.hour <= 5):
                desc_evento = "Acesso de aluno após a hora permitida"
                apontamento = 1
                
            if ent_sai == "0" and (hora_dt.hour >= 19 or hora_dt.hour <= 5):
                desc_evento = "Saída de aluno após a hora permitida"
                apontamento = 1
                
            nome_usuario = row.get("NOME_ALUNO", "")
            categoria = matricula[:3]
            
        elif "NOME_FUNCIONARIO" in df.columns:
            nome_usuario = row.get("NOME_FUNCIONARIO", "")
            categoria = "FUNCIONARIO"
        else:
            nome_usuario = "Desconhecido"
            categoria = "OUTRO"

        usuario, _ = Usuario.objects.get_or_create(matricula=matricula,defaults={
            "nome_usuario": nome_usuario, "categoriaUsuario": categoria
        })

        data = timezone.make_aware(pd.to_datetime(row.get("DATA")))
        data_atual = date.today()
        
        if apontamento == 1 and data.date() == data_atual:            
            mailhog = get_connection(host="mailhog", port=1025, use_tls=False)
            gmail = get_connection(host="smtp.gmail.com", port=587, username=EMAIL_HOST_USER, password=EMAIL_HOST_PASSWORD , use_tls=True)
            mensagem = f"""
            Evento: {desc_evento}
            Usuario: {nome_usuario}
            Matricula: {matricula}
            Data/Hora: {data}
            Area: {row.get('DESC_AREA', '')}
            Leitor: {row.get('DESC_LEITOR', '')}
            """
            
            try:
                send_mail(
                    "Novo uso indevido do cartão detectado",
                    mensagem,
                    EMAIL_HOST_USER,
                    ["anacha@unicamp.br"],
                    connection=gmail,
                    fail_silently=False,
                )

                send_mail(
                    "Novo uso indevido do cartao detectado",
                    mensagem,
                    EMAIL_HOST_USER,
                    ["anacha@unicamp.br"],
                    connection=mailhog,
                    fail_silently=False,
                )

            except Exception as e:
                print("ERRO:", repr(e))
                raise

        obj, created = Acesso.objects.get_or_create(usuario=usuario, data_acesso=data, desc_evento=desc_evento,
            desc_area=row.get("DESC_AREA", ""), ent_sai=row.get("ENT_SAI", ""), defaults={
                "desc_leitor": row.get("DESC_LEITOR", ""), "apontamento": apontamento
            })

        if not created:
            obj.apontamento = apontamento
            obj.save()

        if usuario.user_auth is None:
            tentar_vincular_user_auth.delay(usuario.id, task_id)
            print("PROCESSAMENTO FINALIZADO")

    if Acesso.objects.filter(apontamento=0):
        corrigir_entradas_saida_inconsistentes()
        
    Processamento.objects.filter(task_id=task_id).update(status="SUCCESS")
    print("FINALIZAÇÃO DE PROCESSAMENTO DE XLS")
    print("CACHE LIMPO")
    print(cache.get("users_global"))
    
    
@shared_task(bind=True, queue="fila_rapida")
def processar_csv(self, caminho_arquivo, task_id):

    corr_id = str(task_id)
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
    channel = connection.channel()
    result = channel.queue_declare(queue='', exclusive=True)
    callback_queue = result.method.queue
    resposta = None

    def on_response(ch, method, props, body):
        nonlocal resposta
        print("Mensagem recebida!")

        if props.correlation_id == corr_id:
            resposta = json.loads(body)
            print("Resposta válida recebida!")

    channel.basic_consume(queue=callback_queue, on_message_callback=on_response, auto_ack=True)

    channel.basic_publish(exchange='', routing_key='usuarios_processados', properties=pika.BasicProperties(
        reply_to=callback_queue, correlation_id=corr_id,), body=json.dumps({"task_id": task_id}))

    timeout = 30
    inicio = time.time()

    while resposta is None:
        connection.process_data_events(time_limit=1)

        if time.time() - inicio > timeout:
            break

    print("RESPOSTA:", resposta)
    connection.close()

    if resposta is None:
        raise Exception("Timeout esperando users_service")


    dados = cache.get(f"users_global_{task_id}")

    if not dados:
        print("CACHE NÃO ENCONTRADO")
        return False

    profiles = dados["profiles"]
    users = dados["users"]

    print("Dados recebidos!")
    print(f"USERS: {len(users)}")
    print(f"PROFILES: {len(profiles)}")

    df = pd.read_csv(caminho_arquivo, sep=";", encoding="latin1")
    df.columns = df.columns.str.strip()
    print(df.columns.tolist())

    for _, row in df.iterrows():
        matricula = str(row.get("Matrícula", "")).strip()
        desc_evento = row.get("Evento", "")
        apontamento = (0 if desc_evento == "Apontamento Normal" else 1)
        
        if "Aluno" in df.columns:
            hora_dt = pd.to_datetime(str(row["Hora"]).strip(), format="%H:%M:%S")
            ent_sai = str(row.get("E/S", "")).strip()

            if ent_sai == "1" and (hora_dt.hour >= 18 or hora_dt.hour <= 5) :
                desc_evento = "Acesso de aluno após a hora permitida"
                apontamento = 1
                
            if ent_sai == "0" and (hora_dt.hour >= 19 or hora_dt.hour <= 5):
                desc_evento = "Saída de aluno após a hora permitida"
                apontamento = 1

            nome_usuario = row.get("Aluno", "")
            categoria = matricula[:3]

        elif "Prestador" in df.columns:
            nome_usuario = row.get("Prestador", "")
            categoria = "PRESTADOR"

        elif "Funcionário" in df.columns:
            nome_usuario = row.get("Funcionário", "")
            categoria = "FUNCIONARIO"

        else:
            nome_usuario = "Desconhecido"
            categoria = "OUTRO"

        usuario, _ = Usuario.objects.get_or_create(matricula=matricula,defaults={
            "nome_usuario": nome_usuario, "categoriaUsuario": categoria,
        })

        data_str = f"{row.get('Data')} {row.get('Hora')}"
        data = timezone.make_aware(pd.to_datetime(data_str, dayfirst=True))
        data_atual = date.today()
        
        if apontamento == 1 and data.date() == data_atual:            
            mailhog = get_connection(host="mailhog", port=1025, use_tls=False)
            gmail = get_connection(host="smtp.gmail.com", port=587, username=EMAIL_HOST_USER, password=EMAIL_HOST_PASSWORD , use_tls=True)
            mensagem = f"""
            Evento: {desc_evento}
            Usuario: {nome_usuario}
            Matricula: {matricula}
            Data/Hora: {data}
            Area: {row.get('Área', '')}
            Leitor: {row.get('Leitor', '')}
            """
            
            try:
                send_mail(
                    "Novo uso indevido do cartão detectado",
                    mensagem,
                    EMAIL_HOST_USER,
                    ["anacha@unicamp.br"],
                    connection=gmail,
                    fail_silently=False,
                )

                send_mail(
                    "Novo uso indevido do cartao detectado",
                    mensagem,
                    EMAIL_HOST_USER,
                    ["anacha@unicamp.br"],
                    connection=mailhog,
                    fail_silently=False,
                )

            except Exception as e:
                print("ERRO:", repr(e))
                raise

        obj, created = Acesso.objects.get_or_create(usuario=usuario, data_acesso=data, desc_evento=desc_evento, desc_area=row.get("Área", ""), 
            ent_sai=row.get("E/S", ""),  defaults={
                "desc_leitor": row.get("Leitor", ""),
                "apontamento": apontamento
            })

        if not created:
            obj.apontamento = apontamento
            obj.save()

        if usuario.user_auth is None:
            tentar_vincular_user_auth.delay(usuario.id, task_id)
            print("PROCESSAMENTO FINALIZADO")

    if Acesso.objects.filter(apontamento=0):
        corrigir_entradas_saida_inconsistentes()

    Processamento.objects.filter(task_id=task_id).update(status="SUCCESS")
    print("FINALIZAÇÃO DE PROCESSAMENTO DE CSV")
    cache.delete("users_global")
    print("CACHE LIMPO")
    print(cache.get("users_global"))

@shared_task(bind=True, queue="fila_media")
def tentar_vincular_user_auth(self, usuario_id, task_id):

    self.update_state(state="STARTED")
    dados = cache.get(f"users_global_{task_id}")

    if not dados:
        print("CACHE NÃO ENCONTRADO")
        return False

    profiles = dados["profiles"]
    users = dados["users"]

    if not dados:
        print("CACHE NÃO ENCONTRADO")
        return False
    
    profiles = dados[f"profiles"]
    users = dados[f"users"]

    usuario = Usuario.objects.filter(id=usuario_id, user_auth__isnull=True).first()

    if not usuario:
        return False

    vinculou = vincular_por_matricula(usuario, profiles)

    if not vinculou:
        tentar_vincular_por_nome.delay(usuario.id, task_id)
        
    return vinculou

@shared_task(bind=True, queue="fila_pesada")
def tentar_vincular_por_nome(self, usuario_id, task_id):

    
    self.update_state(state="STARTED")
    dados = cache.get(f"users_global_{task_id}")

    if not dados:
        print("CACHE NÃO ENCONTRADO")
        return False

    profiles = dados["profiles"]
    users = dados["users"]

    print("TASK ID:", task_id)
    
    if not dados:
        print("CACHE NÃO ENCONTRADO")
        return False
  
    users = dados[f"users"]
    
    usuario = Usuario.objects.filter(id=usuario_id, user_auth__isnull=True).first()

    if not usuario or not usuario.nome_usuario:
        return False

    nome_usuario = usuario.nome_usuario.lower().strip()
    melhor = None
    score_max = 0

    for user in users:

        nome_db = (user.get("full_name") or "").lower().strip()

        if not nome_db:
            continue

        score = fuzz.token_sort_ratio(nome_usuario, nome_db)

        if score > score_max:
            score_max = score
            melhor = user

    if melhor and score_max >= 70:
        usuario.user_auth = melhor.get("id")
        usuario.save(update_fields=["user_auth"])
        return True

    return False

def marcar_apontamento2(acesso):
    if acesso.desc_evento == "Apontamento Normal":
        if acesso.apontamento != 3:
            acesso.apontamento = 2
            acesso.save(update_fields=["apontamento"])


def corrigir_entradas_saida_inconsistentes():
    for usuario in Usuario.objects.all():
        for area in Acesso.objects.filter(usuario=usuario).values_list('desc_area', flat=True).distinct():
            acessos = Acesso.objects.filter(usuario=usuario, desc_area=area).order_by('data_acesso')
            stack = None
            for acesso in acessos:
                if acesso.ent_sai == '1':
                    if stack is not None:
                        marcar_apontamento2(acesso)
                    stack = acesso
                else:  
                    if stack is None:  
                        marcar_apontamento2(acesso)
                    else:
                        if not mesmoDia(stack.data_acesso, acesso.data_acesso):
                            marcar_apontamento2(stack)
                        stack = None
            if stack:
                marcar_apontamento2(stack)


def mesmoDia(data1, data2):
    if not data1 or not data2:
        return False

    data1_local = timezone.localtime(data1)
    data2_local = timezone.localtime(data2)

    return (data1_local.year == data2_local.year and data1_local.month == data2_local.month and data1_local.day == data2_local.day)

def iniciar_consumer_usuarios():
    connection = None

    while connection is None:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host="rabbitmq"))
            print("Conectado RabbitMQ (Consumer)")
        except Exception as e:
            print(f"Aguardando RabbitMQ... {e}")
            time.sleep(5)

    channel = connection.channel()
    channel.queue_declare(queue="usuarios_resposta", durable=True)

    def callback(ch, method, properties, body):
        try:
            data = json.loads(body)
            task_id = data["task_id"]
            cache.set(f"users_response_{task_id}", data, timeout=300)
            print(f"Resposta salva no cache para task_id: {task_id}")

        except Exception as e:
            print(f"ERRO ao processar resposta: {str(e)}")

    channel.basic_consume(queue="usuarios_resposta", on_message_callback=callback, auto_ack=True)
    print("Aguardando respostas do users_service...")
    channel.start_consuming()
    
def iniciar_consumer_csv():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="rabbitmq", port=5672, credentials=pika.PlainCredentials("guest", "guest")))
    channel = connection.channel()
    channel.queue_declare(queue="csvs", durable=True)
    channel.basic_consume(queue="csvs", on_message_callback=callback_csv)
    print("Aguardando CSVs...")
    channel.start_consuming()
    
def callback_csv(ch, method, properties, body):
    try:
        dados = json.loads(body)
        nome = dados["nome"]
        conteudo = base64.b64decode(dados["conteudo"])

        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as arquivo_temp:
            arquivo_temp.write(conteudo)
            caminho_arquivo = arquivo_temp.name

        task_id = str(uuid.uuid4())
        Processamento.objects.create(task_id=task_id, status="PENDING")
        print(f"CSV enviado para processamento: {nome}")
        processar_csv.delay(caminho_arquivo, task_id)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print("Erro callback:", repr(e))
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

try:
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="rabbitmq", port=5672, credentials=pika.PlainCredentials("guest", "guest")))
    print("Conectado ao RabbitMQ!")

except Exception as e:
    print("Erro ao conectar:", repr(e))
    raise

consumer_csv_thread = threading.Thread(target=iniciar_consumer_csv, daemon=True) 
consumer_usuarios_thread = threading.Thread(target=iniciar_consumer_usuarios, daemon=True)
consumer_csv_thread.start()
consumer_usuarios_thread.start()