$flag = "C:\storage\.apps_installed"

if (Test-Path $flag) {
    Write-Host "Aplicativos já instalados."
    exit
}

Start-Sleep -Seconds 20

$possiblePaths = @(
    "\\host.lan\Data\rpa-pyauto",
    "\\host.lan\Data"
)

foreach ($path in $possiblePaths) {

    if (Test-Path "$path\install.bat") {

        Write-Host "Executando install.bat em $path"

        Start-Process `
            -FilePath "cmd.exe" `
            -ArgumentList "/c install.bat" `
            -WorkingDirectory $path `
            -Wait

        New-Item -ItemType File -Path $flag -Force

        Write-Host "Instalação concluída."

        exit
    }
}

Write-Host "install.bat não encontrado."