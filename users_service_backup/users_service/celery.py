from celery import Celery

import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "users_service.settings"
)

app = Celery("users_service")

app.config_from_object(
    "django.conf:settings",
    namespace="CELERY"
)

app.autodiscover_tasks()