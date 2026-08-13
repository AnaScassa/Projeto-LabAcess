    @echo off

    cd /d "%~dp0"

    set LOGFILE=C:\Users\Docker\Desktop\Shared\install_log.txt
    set PASTA_RPA=C:\RPA
    set SHARED_FOLDER=C:\Users\Docker\Desktop\Shared

    echo [ %date% %time% ] Iniciando instalacao OEM > %LOGFILE%
    echo Pasta atual: %~dp0 >> %LOGFILE%

    echo Criando pastas do RPA... >> %LOGFILE%

    :: Criar pastas
    mkdir "%PASTA_RPA%"
    mkdir "%PASTA_RPA%\Logs"
    mkdir "%PASTA_RPA%\Arquivos"
    mkdir "%PASTA_RPA%\Temp"

    echo Pastas criadas >> %LOGFILE%

    :: Instalação do PostgreSQL ODBC, SES e Python
    echo Instalando PostgreSQL ODBC... >> %LOGFILE%
    start "PSQL" /wait "%SHARED_FOLDER%\psqlodbc-setup.exe" /quiet /norestart
    echo Exit code PSQL: %errorlevel% >> %LOGFILE%
    echo "PostgreSQL ODBC instalado" 

    :: Instalação do SES
    echo Instalando SES... >> %LOGFILE%
    start "SES" /wait "%SHARED_FOLDER%\SESClient_unicamp.exe" /verysilent /suppressmsgboxes /norestart /sp-
    echo Exit code SES: %errorlevel% >> %LOGFILE%
    echo "SES instalado"

    :: Instalação do Python
    echo Instalando Python... >> %LOGFILE%
    start "Python" /wait "%SHARED_FOLDER%\python-3.13.7-amd64.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    echo Exit code Python: %errorlevel% >> %LOGFILE%
    echo "Python instalado"

    :: Instalação do PyAutoGUI
    echo Instalando PyAutoGUI... >> %LOGFILE%
    "C:\Program Files\Python313\python.exe" -m pip install pyautogui
    echo PyAutoGUI instalado >> %LOGFILE%
    echo "PyAutoGUI instalado"

    :: Instalação do APScheduler
    echo Instalando APScheduler... >> %LOGFILE%
    "C:\Program Files\Python313\python.exe" -m pip install apscheduler
    echo APScheduler instalado >> %LOGFILE%
    echo "APScheduler instalado"

    :: Verificação do Python
    echo Verificando Python... >> %LOGFILE%
    start "Python Check" /wait cmd /c python -c "import time; print('python instalado'); time.sleep(5)"
    echo Exit code Python Check: %errorlevel% >> %LOGFILE%
    echo "Python verificado"

    :: Copiando arquivos do RPA
    echo Copiando arquivos do RPA... >> %LOGFILE%
    xcopy "%SHARED_FOLDER%\rpa-pyauto" "%PASTA_RPA%\rpa-pyauto" /E /I /Y
    echo RPA copiado >> %LOGFILE%
    echo "Arquivos do RPA copiados"


    :: Instalação das dependências do RPA
    echo Instalando dependencias... >> %LOGFILE%
    cd /d "%PASTA_RPA%\rpa-pyauto"
        python -m pip install -r requirements.txt
    echo Dependencias instaladas >> %LOGFILE%
    echo Iniciando RPA... >> %LOGFILE%
    start "" "C:\Program Files\Python313\python.exe" "%PASTA_RPA%\rpa-pyauto\main.py"
    echo RPA iniciado >> %LOGFILE%
    echo Finalizado. >> %LOGFILE%
    echo "Instalacao completa!" 