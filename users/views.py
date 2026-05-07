from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets

from django.contrib.auth import get_user_model

from django.conf import settings
from .serializers import UserApiSerializer, UserProfileSerializer, UserSerializer, SafetyTrainingSerializer
from .models import UserProfile, SafetyTraining, User


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated | HasAPIKey]
    authentication_classes = [JWTAuthentication, SessionAuthentication]

    def get_queryset(self):
        return UserProfile.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

User = get_user_model()

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated | HasAPIKey]
    authentication_classes = [JWTAuthentication, SessionAuthentication]

class UsersSafetyTraining(ModelViewSet):
    serializer_class = SafetyTrainingSerializer
    permission_classes = [IsAuthenticated | HasAPIKey]
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    queryset = SafetyTraining.objects.all()
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated | HasAPIKey]
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    
class UserViewSetApi(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserApiSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
def validar_chave_interna(request):
    return request.headers.get("X-Internal-Key") == settings.SECRET_API_KEY


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def internal_users(request):

    internal_key = request.headers.get("X-Internal-Key")

    if internal_key != settings.SECRET_API_KEY:
        return Response({"error": "Não autorizado"}, status=401)

    users = list(User.objects.values())

    return Response(users)


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def internal_profiles(request):

    internal_key = request.headers.get("X-Internal-Key")

    if internal_key != settings.SECRET_API_KEY:
        return Response({"error": "Não autorizado"}, status=401)

    profiles = list(UserProfile.objects.values())

    return Response(profiles)