from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserProfileViewSet, UsersSafetyTraining

router = DefaultRouter()
router.register(r"user", UserViewSet, basename="user")
router.register(r"user-profile", UserProfileViewSet, basename="user-profile")
router.register(r"safety-training", UsersSafetyTraining, basename="safety-training")

urlpatterns = router.urls