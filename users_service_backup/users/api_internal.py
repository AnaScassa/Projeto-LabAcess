from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import UserProfile
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_api_key.permissions import HasAPIKey

User = get_user_model()


class NoHostValidationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        request.META.pop('HTTP_HOST', None)
        response = self.get_response(request)
        return response


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def internal_users_list(request):
    users = User.objects.all().values()
    return Response(list(users))


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def internal_profiles_list(request):
    profiles = UserProfile.objects.all().values()
    return Response(list(profiles))


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def internal_all_data(request):
    users = list(User.objects.all().values())
    profiles = list(UserProfile.objects.all().values())
    
    return Response({
        "users": users,
        "profiles": profiles
    })
