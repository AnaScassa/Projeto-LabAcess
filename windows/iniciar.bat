@echo off

timeout /t 30 /nobreak

if exist "C:\Users\Docker\Desktop\Shared\install.bat" (
    call "C:\Users\Docker\Desktop\Shared\install.bat"
) else (
    echo [%date% %time%] install.bat nao encontrado >> C:\Users\Public\Desktop\startup_log.txt
)