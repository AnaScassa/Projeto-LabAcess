from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes
)

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated
)

from rest_framework.viewsets import ModelViewSet
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework import viewsets

from django.contrib.auth import get_user_model
from django.conf import settings

from .serializers import (
    UserApiSerializer,
    UserProfileSerializer,
    UserSerializer,
    SafetyTrainingSerializer
)

from .models import UserProfile, SafetyTraining

User = get_user_model()


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    authentication_classes = []
    permission_classes = [AllowAny]


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    authentication_classes = []
    permission_classes = [AllowAny]


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