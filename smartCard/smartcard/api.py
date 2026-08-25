from smartcard.serializers import (GroupSerializer, AcessoSerializer, UsuarioSerializer, ProcessamentoSerializer, ApontamentoSerializer)
from django.http import StreamingHttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.viewsets import ReadOnlyModelViewSet

from django.http import StreamingHttpResponse
from rest_framework.renderers import BaseRenderer, JSONRenderer
from smartcard.models import Acesso, Usuario, Processamento
from django.contrib.auth.models import Group, User, User
from .models import Emails

from rest_framework import serializers, viewsets
from rest_framework_sso.views import ObtainAuthorizationTokenView
from rest_framework_sso import claims
from django.contrib.auth.models import User
from django.utils.translation import gettext as _

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_sso import claims
from rest_framework.renderers import BaseRenderer, JSONRenderer
import json
import time

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

class EventStreamRenderer(BaseRenderer):
    media_type = "text/event-stream"
    format = "sse"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class TaskCompleted(viewsets.ModelViewSet):
    queryset = Processamento.objects.all().order_by("-criado_em")
    serializer_class = ProcessamentoSerializer
    permission_classes = [IsAuthenticated]
    renderer_classes = [EventStreamRenderer]

    def get_queryset(self):

        email = self.request.user.email
        Emails.objects.get_or_create(email=email, defaults={"esta_ativo": True, "ativado": False})

        return Processamento.objects.filter(user=self.request.user.id)
    
    def list(self, request, *args, **kwargs):

        usuario_id = request.user.id

        print("GENERATOR INICIOU", flush=True)
        def eventos():

            while True:

                print("PROCESSAMENTOS", flush=True)

                processamentos = Processamento.objects.filter(user=usuario_id).order_by("-criado_em")

                dados = self.get_serializer(processamentos, many=True).data

                json_data = JSONRenderer().render(dados).decode("utf-8")

                print("PROCESSAMENTOS ATUALIZADOS:", json_data, flush=True)

                yield f"data: {json_data}\n\n"

                time.sleep(2)

        response = StreamingHttpResponse(eventos(), content_type="text/event-stream")

        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"

        return response
    
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
