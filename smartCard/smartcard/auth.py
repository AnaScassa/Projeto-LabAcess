from rest_framework_simplejwt.authentication import JWTAuthentication



class customJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        print("Custom JWT Authentication: get_user called")
        return super().get_user(validated_token)