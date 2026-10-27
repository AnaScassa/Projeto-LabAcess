from rest_framework.response import Response
from rest_framework.decorators import (api_view, authentication_classes, permission_classes)

from rest_framework.permissions import (AllowAny, IsAdminUser, IsAuthenticated)

from rest_framework.viewsets import ModelViewSet
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework import viewsets
from rest_framework_simplejwt.views import TokenObtainPairView

from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .serializers import (AdminUserUpdateSerializer, CustomTokenObtainPairSerializer, UserApiSerializer, UserProfileSerializer, UserSerializer, SafetyTrainingSerializer)

from .models import UserProfile, SafetyTraining

User = get_user_model()


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated | HasAPIKey]


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated | HasAPIKey]


class UsersSafetyTraining(ModelViewSet):
    queryset = SafetyTraining.objects.all()
    serializer_class = SafetyTrainingSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


class UserViewSetApi(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserApiSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]   
    
@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def usuarios_privilegiados(request):
    usuarios = User.objects.filter(Q(is_staff=True) | Q(is_superuser=True)).values(
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_superuser",
    )
    return Response(list(usuarios))

@api_view(["PATCH"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def atualizar_superusuario(request, user_id):
    if not request.user.is_superuser:
        return Response({"detail": "Apenas superusuários podem alterar essa permissão."}, status=403)

    usuario = get_object_or_404(User, id=user_id)
    campos_permitidos = {"is_superuser", "username", "first_name", "last_name", "email"}
    campos_invalidos = set(request.data.keys()) - campos_permitidos
    if campos_invalidos:
        return Response(
            {"detail": "Campos não permitidos: " + ", ".join(sorted(campos_invalidos))},
            status=400,
        )
    if not request.data:
        return Response({"detail": "Informe ao menos um campo para atualizar."}, status=400)

    serializer = AdminUserUpdateSerializer(usuario, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    is_superuser = serializer.validated_data.get("is_superuser", usuario.is_superuser)
    if not is_superuser and usuario.is_superuser:
        if usuario.id == request.user.id:
            return Response({"detail": "Você não pode remover sua própria permissão de superusuário."}, status=400)
        if not User.objects.filter(is_superuser=True).exclude(id=usuario.id).exists():
            return Response({"detail": "O sistema precisa manter ao menos um superusuário."}, status=400)

    serializer.save()
    return Response(serializer.data)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer