@echo off

set LOGFILE=C:\Users\Public\Desktop\install_log.txt
set PASTA_RPA=C:\RPA\Arquivos

echo [ %date% %time% ] Iniciando instalacao OEM > %LOGFILE%
echo Pasta atual: %~dp0 >> %LOGFILE%

echo Criando pasta do RPA... >> %LOGFILE%

if not exist "%PASTA_RPA%" (
    mkdir "%PASTA_RPA%"
    echo Pasta criada com sucesso >> %LOGFILE%
) else (
    echo Pasta ja existe >> %LOGFILE%
)

echo Instalando PostgreSQL ODBC... >> %LOGFILE%
start "PSQL" /wait "%~dp0psqlodbc-setup.exe" /quiet /norestart
echo Exit code PSQL: %errorlevel% >> %LOGFILE%

echo Instalando SES... >> %LOGFILE%
start "SES" /wait "%~dp0SESClient_unicamp.exe" /verysilent /suppressmsgboxes /norestart /sp-
echo Exit code SES: %errorlevel% >> %LOGFILE%

echo Instalando Python... >> %LOGFILE%
start "Python" /wait "%~dp0python-3.13.7-amd64.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
echo Exit code Python: %errorlevel% >> %LOGFILE%

echo Verificando Python... >> %LOGFILE%
start "Python Check" /wait cmd /c python -c "import time; print('python instalado'); time.sleep(5)"
echo Exit code Python Check: %errorlevel% >> %LOGFILE%

echo Finalizado. >> %LOGFILE%