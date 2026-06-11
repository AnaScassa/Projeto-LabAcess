from pathlib import Path
from datetime import timedelta
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Helper function to read Docker secrets
def read_secret(secret_name, default=None):
    """
    Lê um secret do Docker, com fallback para variável de ambiente.
    """
    secret_path = f'/run/secrets/{secret_name}'
    
    # Tenta ler do arquivo secret do Docker
    try:
        if os.path.isfile(secret_path):
            with open(secret_path, 'r') as f:
                content = f.read().strip()
                if content:
                    return content
    except (FileNotFoundError, IsADirectoryError, PermissionError):
        pass
    
    # Fallback para variável de ambiente
    env_value = os.getenv(secret_name.upper())
    if env_value:
        return env_value
    
    # Fallback para valor padrão
    return default


# SECURITY
SECRET_KEY = read_secret('jwt_secret', 'django-insecure-(1-0%ilh9nmtevz%&ztgap_-#nth4spofu9m3ovwhvb%2b1-iw')

DEBUG = True

ALLOWED_HOSTS = [
    "users_service",
    "users_service:8000",
    "localhost",
    "127.0.0.1",
    "*"
]

USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = None

CSRF_TRUSTED_ORIGINS = [
    "http://users_service:8000",
]

# USER MODEL
AUTH_USER_MODEL = 'users.User'

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://143.106.5.41:5173",
    "http://localhost:3000",
    "http://ana.ccs.unicamp.br:3000",
    "http://ccspc-041.ccs.unicamp.br:3000",
]

# APPLICATIONS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'rest_framework_sso',
    'django.contrib.staticfiles',

    # DRF
    'rest_framework',
    'rest_framework_api_key',

    # Utils
    'django_extensions',
    'corsheaders',

    # Celery
    'django_celery_beat',
    'django_celery_results',

    # Allauth
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',

    # Apps
    'users',
    'rest_framework_simplejwt',
]

SITE_ID = 1

# MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'users_service.middleware.InternalRequestMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'allauth.account.middleware.AccountMiddleware',
]

# IMPORTANTE
# A PASTA DO PROJETO DEVE CHAMAR users_service
ROOT_URLCONF = 'users_service.urls'

# TEMPLATES
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI
WSGI_APPLICATION = 'users_service.wsgi.application'

# DATABASE
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv('DB_NAME', 'users_db'),
        "USER": os.getenv('DB_USER', 'postgres'),
        "PASSWORD": read_secret('postgres_password', 'postgres'),
        "HOST": os.getenv('DB_HOST', 'postgres'),
        "PORT": os.getenv('DB_PORT', '5432'),
    }
}

# PASSWORD VALIDATORS
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# INTERNATIONALIZATION
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'America/Sao_Paulo'

USE_I18N = True
USE_TZ = True

# STATIC FILES
STATIC_URL = 'static/'

# MEDIA FILES
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "/media/"

# DEFAULT PK
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# JWT
SIMPLE_JWT = {
    "ALGORITHM": read_secret('jwt_algorithm', 'HS256'),
    "SIGNING_KEY": read_secret('jwt_secret', 'django-insecure-(1-0%ilh9nmtevz%&ztgap_-#nth4spofu9m3ovwhvb%2b1-iw'),
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}
# REST FRAMEWORK
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),

    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

# CELERY
CELERY_BROKER_URL = "redis://redis:6379/0"

CELERY_RESULT_BACKEND = "redis://redis:6379/0"

CELERY_ACCEPT_CONTENT = ["json"]

CELERY_TASK_SERIALIZER = "json"

CELERY_RESULT_SERIALIZER = "json"

# REDIS CACHE
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SERIALIZER": "django_redis.serializers.json.JSONSerializer",
        }
    }
}

# ENV VARIABLES
SECRET_API_KEY = read_secret('secret_api_key')
SECRET_AUTHORIZATION = read_secret('secret_authorization')
