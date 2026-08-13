from django.contrib import admin
from django.urls import path
from django.urls import include
from smartcard.api import ObtainAuthorizationTokenView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/acesso/', include('smartcard.urlsapi')),
    path('authorize/', ObtainAuthorizationTokenView.as_view()),
    ]
