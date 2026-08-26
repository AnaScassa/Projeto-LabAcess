from smartcard.views import buscar_registro, carregar_acesso, limpar_resposta, lista_usuarios, mudar_apontamento, receber_resposta, usuarios_ativos, emails, lista_emails, desativar_email, cadastrar_email, registrar_email
from smartcard.api import AcessoViewSet, GroupViewSet, UsuarioViewSet, TaskCompleted, ApontamentoViewSet

from django.urls import include, path

from rest_framework import routers


router = routers.DefaultRouter()
router.register(r"groups", GroupViewSet)
router.register(r"acessos", AcessoViewSet)
router.register(r"usuarios", UsuarioViewSet)
router.register(r"processamento", TaskCompleted)
router.register(r"apontamento", ApontamentoViewSet, basename="apontamento")

urlpatterns = [
    path('', include(router.urls)),
    path("upload-xls/", carregar_acesso, name="upload_xls"),
    path("lista-usuarios/", lista_usuarios, name="lista_usuarios"),
    path("desativar-apontamento/<int:id>/", mudar_apontamento, name="desativar_apontamento"),
    path("buscar-registro/", buscar_registro, name="buscar_registro"),
    path("usuarios-ativos", usuarios_ativos, name="usuarios_ativos"),
    path("emails", emails, name="emails"),
    path("lista-emails", lista_emails, name="lista_emails"),
    path("desativar-emails/<int:id>/", desativar_email, name="desativar_email"),
    path("cadastrar-email/", cadastrar_email, name="cadastrar_email"),
    path("registrar-email/", registrar_email, name="registrar_email"),
    path("receber-resposta/", receber_resposta, name="receber_resposta"),
    path("limpar-resposta/", limpar_resposta, name="limpar_resposta"),
]
