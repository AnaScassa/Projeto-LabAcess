from rest_framework import serializers
from .models import UserProfile, DegreeArea, User, SafetyTraining

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
        
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["url", "username", "email", "groups"]