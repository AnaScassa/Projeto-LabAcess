from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta

from django.http import JsonResponse
from django.core.cache import cache
from django.db import transaction
from django_celery_results.models import TaskResult

from .tasks import processar_xls, processar_csv
from .services import salvar_arquivo_temporario
from .models import Emails, Resposta, Usuario, Acesso, Processamento
from smartcard.rabbitmq.publisher import enviar_mensagem
from rest_framework_api_key.permissions import HasAPIKey
from datetime import date

import uuid
import requests

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_acessos(request):
    acessos = Acesso.objects.values('id', 'usuario_id', 'data_acesso', 'desc_evento', 'desc_area', 'desc_leitor', 'ent_sai')
    return Response(list(acessos), status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_usuarios(request):
    usuarios = Usuario.objects.values('id', 'nome_usuario')
    return Response(list(usuarios), status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usuarios_ativos(request):
    hoje = date.today()

    acessos = (
        Acesso.objects.filter(data_acesso__date=hoje).order_by('usuario_id', '-data_acesso').values('id', 'usuario_id', 'data_acesso', 'desc_evento', 'desc_area', 'ent_sai')
    )

    ultimos_acessos = {}

    for acesso in acessos:
        usuario_id = acesso['usuario_id']

        if usuario_id not in ultimos_acessos:
            ultimos_acessos[usuario_id] = acesso

    return JsonResponse(list(ultimos_acessos.values()), safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_emails(request):
    emails = Emails.objects.filter(esta_ativo=True).values('id', 'email', 'criado_em', 'ativado')
    return Response(list(emails), status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def desativar_email(request, id):
    try:
        email_obj = Emails.objects.get(id=id)
        email_obj.esta_ativo = False
        email_obj.ativado = False
        email_obj.save()
        return Response({"msg": "Email desativado com sucesso"})
    
    except Emails.DoesNotExist:
        return Response({"erro": "Email não encontrado"}, status=404)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cadastrar_email(request):
    email = request.data.get("email")

    if not email:
        return Response({"erro": "Email não fornecido"}, status=400)

    for existing_email in Emails.objects.filter(email=email):
        if existing_email.esta_ativo and existing_email.ativado:
            return Response({"erro": "Email já cadastrado"}, status=400)
        else:
            existing_email.esta_ativo = True
            existing_email.ativado = True
            existing_email.criado_em = date.today()
            existing_email.save()
            return Response({"msg": "Email reativado com sucesso"}, status=200)

    Emails.objects.create(email=email, ativado=True, esta_ativo=True, criado_em=date.today())    
    
    return Response({"msg": "Email cadastrado com sucesso"}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def acessos_erro(request):
    acessos = Acesso.objects.filter(apontamento__in=[1, 2]).values('id', 'data_acesso', 'desc_evento', 'usuario_id', 'apontamento')
    
    # 0 = acessos sem erro
    # 1 = acessos com desc_evento inconsistente
    # 2 = acessos com ent_sai inconsistente
    # 3 = acessos com apontamento 1 e 2 já vizualizados pelo usuário

    return Response(list(acessos), status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mudar_apontamento(request, id):

    try:
        ap = Acesso.objects.get(id=id)
        ap.apontamento = 3
        ap.save()
        return Response({"msg": "Apontamento desativado com sucesso"})
    
    except Acesso.DoesNotExist:
        return Response({"erro": "Não encontrado"}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated | HasAPIKey])
def carregar_acesso(request):

    arquivo = request.FILES.get("file")

    if not arquivo:
        return Response({"erro": "Nenhum arquivo enviado."}, status=status.HTTP_400_BAD_REQUEST)

    if not arquivo.name.endswith((".xls", ".csv")):
        return Response({"erro": "Apenas arquivos .xls e .csv são permitidos."},status=status.HTTP_400_BAD_REQUEST)

    caminho = salvar_arquivo_temporario(arquivo)
    task_uuid = str(uuid.uuid4())

    enviar_mensagem("usuarios_processados", {"task_id": task_uuid, "arquivo": caminho})

    with transaction.atomic():
        Processamento.objects.create(task_id=task_uuid, status="PENDING", user=request.user.id)

    if arquivo.name.endswith((".xls")):
        processar_xls.apply_async(args=[caminho, task_uuid],task_id=task_uuid)

    elif arquivo.name.endswith(".csv"):
        processar_csv.apply_async(args=[caminho, task_uuid],task_id=task_uuid)

    return Response({"message": "Arquivo enviado para processamento.", "task_id": task_uuid, "status": "PENDING",
        "user": request.user.id}, status=status.HTTP_202_ACCEPTED)
    
def agora_por_fila():
    return {
        "fila_rapida": TaskResult.objects.filter(status="STARTED", task_name__icontains="tentar_vincular_user_auth").count(),
        "fila_media": TaskResult.objects.filter(status="STARTED",task_name__icontains="tentar_vincular_por_nome").count(),
        "fila_pesada": TaskResult.objects.filter(status="STARTED", task_name__icontains="processar_xls").count(),
    }

def verificar_tasks_user(user, user_id):
    total = Processamento.objects.filter(user=user, user_id=user_id).count()
    success = Processamento.objects.filter(user=user, status="SUCCESS", user_id=user_id).count()

    if total == success:
        Processamento.objects.filter(user=user).delete()
        
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def buscar_registro(request):
    data_inicio = request.data.get("data_inicio")
    hora_inicio = request.data.get("hora_inicio")
    data_fim = request.data.get("data_fim")
    hora_fim = request.data.get("hora_fim")

    agora = datetime.now()
    hora_calculada = agora - timedelta(minutes=10)

    if data_inicio:
        data_inicio = datetime.strptime(data_inicio, "%Y-%m-%d").strftime("%d%m%Y")
    else:
        data_inicio = agora.strftime("%d%m%Y")

    if hora_inicio:
        hora_inicio = hora_inicio.replace(":", "")
    else:
        hora_inicio = hora_calculada.strftime("%H%M")

    if data_fim:
        data_fim = datetime.strptime(data_fim, "%Y-%m-%d").strftime("%d%m%Y")
    else:
        data_fim = hora_calculada.strftime("%d%m%Y")

    if hora_fim:
        hora_fim = hora_fim.replace(":", "")
    else:
        hora_fim =  agora.strftime("%H%M")

    mensagem = {
        "user_id": request.user.id,
        "data_inicio": data_inicio,
        "hora_inicio": hora_inicio,
        "data_fim": data_fim,
        "hora_fim": hora_fim,
    }

    print(mensagem)

    enviar_mensagem("buscar", mensagem)
    return Response({"status": "enviado"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def emails(request):
    try:
        r = requests.get("http://mailhog:8025/api/v2/messages", timeout=5)
        data = r.json()

        emails = data.get("items", [])

        ja_enviados = cache.get("emails_enviados", [])

        novos = []

        for email in emails:
            email_id = email["ID"]

            if email_id not in ja_enviados:
                novos.append(email)
                ja_enviados.append(email_id)

        cache.set("emails_enviados", ja_enviados, timeout=3600)

        return JsonResponse({"items": novos, "total_novos": len(novos)})

    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": "MailHog indisponível", "details": str(e)}, status=500)
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def registrar_email(request):
    print(request.user)
    print("email:", request.user.email)
    print(request.user.id)

    Emails.objects.get_or_create(email=request.user.email, defaults={"esta_ativo": True, "ativado": False,},)

    return Response({"message": "Email registrado com sucesso"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def receber_resposta(request):
    resposta = Resposta.objects.values("status", "quantidade", "criado_em").order_by("-criado_em")[:1]
    return Response(resposta, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def limpar_resposta(request):
    Resposta.objects.all().delete()
    return Response({"message": "Respostas limpas com sucesso"}, status=status.HTTP_200_OK)
    