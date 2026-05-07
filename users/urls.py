from django.urls import include

from rest_framework.routers import DefaultRouter, path
from .views import UserViewSet, UserProfileViewSet, UsersSafetyTraining, internal_profiles, internal_users
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r"user", UserViewSet, basename="user")
router.register(r"user-profile", UserProfileViewSet, basename="user-profile")
router.register(r"safety-training", UsersSafetyTraining, basename="safety-training")

urlpatterns = [
    path("", include(router.urls)),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("internal/users/", internal_users),
    path("internal/profiles/", internal_profiles),
]