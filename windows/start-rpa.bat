@echo off
setlocal
title LabAcess RPA - rpa-pyauto

set RPA_DIR=C:\Users\Docker\Desktop\rpa-pyauto
set PYTHON=python
set LOG_DIR=C:\Users\Docker\Desktop\rpa-pyauto\Logs

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
cd /d "%RPA_DIR%"

if not exist "%RPA_DIR%\main.py" (
	echo [%date% %time%] ERRO: main.py nao encontrado em "%RPA_DIR%" >> "%LOG_DIR%\rpa-startup.log"
	exit /b 1
)

where python >> "%LOG_DIR%\rpa-startup.log" 2>&1
echo [%date% %time%] Diretorio de execucao: %CD% >> "%LOG_DIR%\rpa-startup.log"

echo [%date% %time%] Aguardando RabbitMQ em 127.0.0.1:5672... >> "%LOG_DIR%\rpa-startup.log"
:wait_rabbitmq
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "if (Test-NetConnection -ComputerName 127.0.0.1 -Port 5672 -InformationLevel Quiet) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
	timeout /t 5 /nobreak >nul
	goto wait_rabbitmq
)

echo [%date% %time%] RabbitMQ disponível. Iniciando RPA... >> "%LOG_DIR%\rpa-startup.log"
python main.py >> "%LOG_DIR%\rpa-startup.log" 2>&1
