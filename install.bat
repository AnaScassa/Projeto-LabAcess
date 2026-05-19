@echo off

echo Instalando PostgreSQL ODBC...
start /wait psqlodbc-setup.exe /quiet /norestart

echo Instalando SES...
start /wait SESClient_unicamp.exe /S

echo Finalizado.