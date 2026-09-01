from rest_framework_simplejwt.authentication import JWTAuthentication



class customJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        return super().get_user(validated_token)