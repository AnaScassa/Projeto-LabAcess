from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_api_key.permissions import HasAPIKey

from .tasks import processar_xls
from .services import salvar_arquivo_temporario
from .models import Usuario, Acesso, Processamento
from django_celery_results.models import TaskResult
from django.db import transaction

import uuid

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def lista_acessos(request):
    acessos = Acesso.objects.values(
        'id',
        'usuario_id',
        'data_acesso',
        'desc_evento',
        'desc_area',
        'desc_leitor',
        'ent_sai'
    )
    return Response(list(acessos), status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([HasAPIKey])
def lista_usuarios(request):
    usuarios = Usuario.objects.values(
        'id',
        'nome_usuario'
    )
    return Response(list(usuarios), status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([HasAPIKey])
def acessos_erro(request):
    acessos = Acesso.objects.filter(apontamento__in=[1, 2]).values(
        'id',
        'data_acesso',
        'desc_evento',
        'usuario_id',
        'apontamento',
    )
    
    # 0 = acessos sem erro
    # 1 = acessos com desc_evento inconsistente
    # 2 = acessos com ent_sai inconsistente
    # 3 = acessos com apontamento 1 e 2 já vizualizados pelo usuário

    return Response(list(acessos), status=status.HTTP_200_OK)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated | HasAPIKey])
def mudar_apontamento(request, id):

    try:
        ap = Acesso.objects.get(id=id)
        ap.apontamento = 3
        ap.save()
        return Response({"msg": "Apontamento desativado com sucesso"})
    
    except Acesso.DoesNotExist:
        return Response({"erro": "Não encontrado"}, status=404)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated | HasAPIKey])
def carregar_acesso(request):

    arquivo = request.FILES.get("file")

    if not arquivo:
        return Response(
            {"erro": "Nenhum arquivo enviado."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not arquivo.name.endswith(".xls"):
        return Response(
            {"erro": "Apenas arquivos .xls são permitidos."},
            status=status.HTTP_400_BAD_REQUEST 
        )

    caminho = salvar_arquivo_temporario(arquivo)

    task_uuid = str(uuid.uuid4())

    with transaction.atomic():
        Processamento.objects.create(
            task_id=task_uuid,
            status="PENDING",
            user=request.user.id
        )

    processar_xls.apply_async(
        args=[caminho],
        task_id=task_uuid
    )

    return Response(
        {
            "message": "Arquivo enviado para processamento.",
            "task_id": task_uuid,
            "status": "PENDING",
            "user": request.user.id
        },
        status=status.HTTP_202_ACCEPTED
    )
def agora_por_fila():
    return {
        "fila_rapida": TaskResult.objects.filter(
            status="STARTED",
            task_name__icontains="tentar_vincular_user_auth"
        ).count(),

        "fila_media": TaskResult.objects.filter(
            status="STARTED",
            task_name__icontains="tentar_vincular_por_nome"
        ).count(),

        "fila_pesada": TaskResult.objects.filter(
            status="STARTED",
            task_name__icontains="processar_xls"
        ).count(),
    }

def verificar_tasks_user(user, user_id):
    total = Processamento.objects.filter(user=user, user_id=user_id).count()
    success = Processamento.objects.filter(user=user, status="SUCCESS", user_id=user_id).count()

    if total == success:
        Processamento.objects.filter(user=user).delete()