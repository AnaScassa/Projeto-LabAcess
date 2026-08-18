import logging

from django.core.cache import cache
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile, DegreeArea, User, SafetyTraining

logger = logging.getLogger(__name__)

class SafetyTrainingSerializer(serializers.ModelSerializer):
    class Meta:
        user_id = serializers.PrimaryKeyRelatedField(
            many=True,
            queryset=DegreeArea.objects.all()
        )
        model = SafetyTraining
        fields = [
            "user_id",
            "expiration_date"
        ]

class UserProfileSerializer(serializers.ModelSerializer):
    degree_area = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=DegreeArea.objects.all()
    )
    is_complete = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            "user",
            "degree_area",
            "academic_id",
            "phone",
            "emergency_contact",
            "emergency_phone",
            "is_complete",
        ]


class UserSerializer(serializers.HyperlinkedModelSerializer):
    userProfile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "url",
            "id",
            "username",
            "email",
            "full_name",
            "first_name",
            "last_name",
            "userProfile",
        ]

    def get_userProfile(self, obj):
        request = self.context.get("request")

        if not hasattr(obj, "userprofile"):
            return None

        return request.build_absolute_uri(
            f"/api/users/user-profile/{obj.id}/"
        )
        
class UserApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "username",
            "email",
            "first_name",
            "last_name",
            "date_joined"
        ]
        
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["username"] = user.username
        token["is_superuser"] = user.is_superuser
        token["iss"] = "users-service"

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data["email"] = self.user.email
        data["username"] = self.user.username
        data["is_superuser"] = self.user.is_superuser

        return data