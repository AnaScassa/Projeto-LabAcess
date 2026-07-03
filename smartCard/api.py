from django.contrib import auth
from urllib3 import request

from smartcard.serializers import (GroupSerializer, AcessoSerializer, UsuarioSerializer, ProcessamentoSerializer, ApontamentoSerializer)

from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, get_user_model
from rest_framework.decorators import action
from rest_framework.viewsets import ReadOnlyModelViewSet

from smartcard.models import Acesso, Usuario, Processamento
from django.contrib.auth.models import Group, User, User
from .models import Emails

from rest_framework import serializers, viewsets, exceptions
from rest_framework_sso.views import ObtainAuthorizationTokenView
from rest_framework_sso import claims
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.utils.translation import gettext as _

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_sso import claims


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

class AcessoViewSet(viewsets.ModelViewSet):
    queryset = Acesso.objects.all() 
    serializer_class = AcessoSerializer
    permission_classes = [IsAuthenticated]

class UsuarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Usuario.objects.all().order_by("nome_usuario")
    serializer_class = UsuarioSerializer 
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset()

class TaskCompleted(viewsets.ModelViewSet):
    queryset = Processamento.objects.all().order_by("-criado_em")
    serializer_class = ProcessamentoSerializer
    permission_classes = [IsAuthenticated]    

    def get_queryset(self):
        
        email = self.request.user.email
        Emails.objects.get_or_create(email=email, defaults={"esta_ativo": True, "ativado": False})

        return Processamento.objects.filter(user=self.request.user.id)
    
    def get_object(self):
        obj = super().get_object()
        if not obj.exists():
            obj = []  
        return obj
        
    @action(detail=False, methods=['get'])
    def status(self, request):
        tem_tasks = Processamento.objects.filter(user=request.user).exclude(status="ERRO")

        if not tem_tasks.exists():
            tem_tasks = None

        return Response({"tem_tasks": tem_tasks.exists()})
    
class ApontamentoViewSet(ReadOnlyModelViewSet):
    serializer_class = ApontamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Acesso.objects.filter(apontamento__in=[1, 2])
    
class AuthorizationTokenSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=True)

    class Meta:
        fields = ['user']
        
class CustomObtainAuthorizationTokenView(ObtainAuthorizationTokenView):
    serializer_class = AuthorizationTokenSerializer

def create_authorization_payload(session_token, user, user_obj, **kwargs):
    return {
        claims.TOKEN: claims.TOKEN_AUTHORIZATION,
        claims.SESSION_ID: session_token.pk,
        claims.USER_ID: user.pk,
        claims.EMAIL: user.email,
        "user_id": user_obj.pk,
    }

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.ModelSerializer  
    queryset = User.objects.none()

    def get_queryset(self):
        if not self.request.user.is_authenticated or not self.request.auth:
            return User.objects.none()

        return User.objects.filter(id=self.request.auth.get(claims.USER_ID))
        
        
def get_payload_from_request(self):
    auth = JWTAuthentication()
    try:
        header = auth.get_header(self.request)
        raw_token = auth.get_raw_token(header)
        validated_token = auth.get_validated_token(raw_token)
        print("Payload do JWT:", validated_token.payload)  
        email = validated_token.payload.get("email")
        Emails.objects.get_or_create(email=email, defaults={"esta_ativo": True, "ativado": False})
        return validated_token.payload
    except Exception as e:
        print("Erro ao ler JWT:", e)
        return {}
