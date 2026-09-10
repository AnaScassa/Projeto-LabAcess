@echo off
setlocal
title LabAcess RPA - executando main.py

set "RPA_DIR=C:\Users\Docker\Desktop\Shared\rpa-pyauto\"
set "PYTHON=C:\Program Files\Python313\python.exe"
if not exist "%PYTHON%" set "PYTHON=%RPA_DIR%.venv-1\Scripts\python.exe"
if not defined PYTHON set "PYTHON=python"
set "LOG_DIR=%RPA_DIR%Logs"

if not exist "%RPA_DIR%" (
	echo [%date% %time%] ERRO: pasta do RPA nao encontrada em "%RPA_DIR%" >&2
	exit /b 1
)
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
cd /d "%RPA_DIR%"

if not exist "%RPA_DIR%\main.py" (
	echo [%date% %time%] ERRO: main.py nao encontrado em "%RPA_DIR%" >> "%LOG_DIR%\rpa-startup.log"
	exit /b 1
)

"%PYTHON%" --version >> "%LOG_DIR%\rpa-startup.log" 2>&1
if errorlevel 1 (
	echo [%date% %time%] ERRO: Python nao pode ser iniciado: "%PYTHON%" >> "%LOG_DIR%\rpa-startup.log"
	exit /b 1
)
echo [%date% %time%] Diretorio de execucao: %CD% >> "%LOG_DIR%\rpa-startup.log"

echo RPA iniciado.
echo Pasta: %CD%
echo Python: %PYTHON%
echo [%date% %time%] Iniciando RPA com "%PYTHON%"... >> "%LOG_DIR%\rpa-startup.log"
"%PYTHON%" -u main.py 2>&1 | powershell.exe -NoProfile -Command "$input | Tee-Object -FilePath '%LOG_DIR%\rpa-startup.log' -Append"
