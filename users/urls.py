from django.urls import include

from rest_framework.routers import DefaultRouter, path
from .views import CustomTokenObtainPairView, UserViewSet, UserProfileViewSet, UsersSafetyTraining
from .api_internal import internal_users_list, internal_profiles_list, internal_all_data
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r"user", UserViewSet, basename="user")
router.register(r"user-profile", UserProfileViewSet, basename="user-profile")
router.register(r"safety-training", UsersSafetyTraining, basename="safety-training")

urlpatterns = [
    path("", include(router.urls)),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("internal/users/", internal_users_list, name="internal_users"),
    path("internal/profiles/", internal_profiles_list, name="internal_profiles"),
    path("internal/all-data/", internal_all_data, name="internal_all_data"),
]