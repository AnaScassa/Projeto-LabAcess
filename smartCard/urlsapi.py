from smartcard.views import carregar_acesso, lista_usuarios, mudar_apontamento
from smartcard.api import AcessoViewSet, GroupViewSet, UsuarioViewSet, TaskCompleted, ApontamentoViewSet

from django.urls import include, path

from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = routers.DefaultRouter()
router.register(r"groups", GroupViewSet)
router.register(r"acessos", AcessoViewSet)
router.register(r"usuarios", UsuarioViewSet)
router.register(r"processamento", TaskCompleted)
router.register(r"apontamento", ApontamentoViewSet, basename="apontamento")

urlpatterns = [
    path('', include(router.urls)),
    path("upload-xls/", carregar_acesso, name="upload_xls"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("lista-usuarios/", lista_usuarios, name="lista_usuarios"),
    path("desativar-apontamento/<int:id>/", mudar_apontamento),
    ]
