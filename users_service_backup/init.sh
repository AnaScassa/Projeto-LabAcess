#!/bin/sh

until python -c 'import socket; s=socket.socket(); s.connect(("postgres",5432))'; do
    echo 'Esperando postgres...';
    sleep 2;
    done;
    until python -c 'import socket; s=socket.socket(); s.connect(("rabbitmq",5672))'; do
        echo 'Esperando rabbitmq...';
        sleep 2;
    done;
    python manage.py makemigrations;
    python manage.py migrate;
    python manage.py init_users;
    python manage.py runserver 0.0.0.0:8000 &
    celery -A users_service worker --loglevel=info