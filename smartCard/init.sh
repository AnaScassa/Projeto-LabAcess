#!/bin/sh

until python -c 'import socket; s=socket.socket(); s.connect(("postgres",5432))'; do
        echo 'Esperando postgres...';
        sleep 2;
    done;
    until python -c 'import socket; s=socket.socket(); s.connect(("redis",6379))'; do
        echo 'Esperando redis...';
        sleep 2;
    done;
    until python -c 'import socket; s=socket.socket(); s.connect(("rabbitmq",5672))'; do
        echo 'Esperando rabbitmq...';
        sleep 2;
    done;
    python manage.py makemigrations;
    python manage.py migrate;
    python manage.py runserver 0.0.0.0:8080 &
    celery -A core worker \
        --pool=solo \
        --concurrency=1 \
        --loglevel=info \
        -Q fila_rapida,fila_media,fila_pesada