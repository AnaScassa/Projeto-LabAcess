@echo off

cd /d "%~dp0"

set LOGFILE=C:\Users\Docker\Desktop\Shared\install_log.txt
set PASTA_RPA=C:\RPA
set SHARED_FOLDER=C:\Users\Docker\Desktop\Shared
set PYTHON_PATH=C:\Program Files\Python311\python.exe

echo [ %date% %time% ] Iniciando instalacao OEM > %LOGFILE%
echo Pasta atual: %~dp0 >> %LOGFILE%

echo Criando pastas do RPA... >> %LOGFILE%

mkdir "%PASTA_RPA%"
mkdir "%PASTA_RPA%\Logs"
mkdir "%PASTA_RPA%\Arquivos"
mkdir "%PASTA_RPA%\Temp"

echo Pastas criadas >> %LOGFILE%

echo Instalando PostgreSQL ODBC... >> %LOGFILE%

start "PSQL" /wait "%SHARED_FOLDER%\psqlodbc-setup.exe" /quiet /norestart

echo Exit code PSQL: %errorlevel% >> %LOGFILE%

echo Instalando SES... >> %LOGFILE%

start "SES" /wait "%SHARED_FOLDER%\SESClient_unicamp.exe" /verysilent /suppressmsgboxes /norestart /sp-

echo Exit code SES: %errorlevel% >> %LOGFILE%

echo Instalando Python... >> %LOGFILE%

start "Python" /wait "%SHARED_FOLDER%\python-3.11.9-amd64.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0

timeout /t 15

echo Exit code Python: %errorlevel% >> %LOGFILE%

echo Verificando Python... >> %LOGFILE%

"%PYTHON_PATH%" --version >> %LOGFILE% 2>&1

echo Python verificado >> %LOGFILE%

echo Atualizando pip... >> %LOGFILE%

"%PYTHON_PATH%" -m pip install --upgrade pip >> %LOGFILE% 2>&1

echo Pip atualizado >> %LOGFILE%

echo Instalando dependencias Python... >> %LOGFILE%

"%PYTHON_PATH%" -m pip install pyautogui pyscreeze pillow opencv-python >> %LOGFILE% 2>&1

echo Dependencias Python instaladas >> %LOGFILE%

echo Copiando arquivos do RPA... >> %LOGFILE%

xcopy "%SHARED_FOLDER%\rpa-pyauto" "%PASTA_RPA%\rpa-pyauto" /E /I /Y >> %LOGFILE% 2>&1

echo Arquivos copiados >> %LOGFILE%

echo Instalando requirements.txt... >> %LOGFILE%

cd /d "%PASTA_RPA%\rpa-pyauto"

"%PYTHON_PATH%" -m pip install -r requirements.txt >> %LOGFILE% 2>&1

echo Requirements instalados >> %LOGFILE%

echo Testando PyAutoGUI... >> %LOGFILE%

"%PYTHON_PATH%" -c "import pyautogui; import pyscreeze; print('PyAutoGUI OK')" >> %LOGFILE% 2>&1

echo Teste finalizado >> %LOGFILE%

echo Iniciando RPA... >> %LOGFILE%

start "" "%PYTHON_PATH%" "%PASTA_RPA%\rpa-pyauto\main.py"

echo RPA iniciado >> %LOGFILE%

echo Instalacao completa >> %LOGFILE%

pause