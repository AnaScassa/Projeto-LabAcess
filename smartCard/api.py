from smartcard.serializers import (
    GroupSerializer,
    UserSerializer,
    AcessoSerializer,
    UsuarioSerializer,
    ProcessamentoSerializer,
    ApontamentoSerializer
)

from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.viewsets import ReadOnlyModelViewSet

from smartcard.models import Acesso, Usuario, Processamento
from users.models import User
from django.contrib.auth.models import Group


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated | HasAPIKey]
    authentication_classes = [JWTAuthentication, SessionAuthentication]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated | HasAPIKey]
    authentication_classes = [JWTAuthentication, SessionAuthentication]

class AcessoViewSet(viewsets.ModelViewSet):
    queryset = Acesso.objects.all() 
    serializer_class = AcessoSerializer
    permission_classes = [IsAuthenticated | HasAPIKey]
    authentication_classes = [JWTAuthentication, SessionAuthentication]

class UsuarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Usuario.objects.all().order_by("nome_usuario")
    serializer_class = UsuarioSerializer 
    permission_classes = [IsAuthenticated | HasAPIKey]
    authentication_classes = [JWTAuthentication, SessionAuthentication]

    def get_queryset(self):
        return super().get_queryset()

class TaskCompleted(viewsets.ModelViewSet):
    queryset = Processamento.objects.all()
    serializer_class = ProcessamentoSerializer

    @action(detail=False, methods=['get'])
    def status(self, request):
        tem_tasks = Processamento.objects.exists()

        return Response({
            "tem_tasks": tem_tasks
        })
    
class ApontamentoViewSet(ReadOnlyModelViewSet):
    serializer_class = ApontamentoSerializer

    def get_queryset(self):
        return Acesso.objects.filter(apontamento__in=[1, 2])