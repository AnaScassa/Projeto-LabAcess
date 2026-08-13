# Windows - RPA Automation Setup

Esta pasta contém scripts e configurações para a instalação e execução de automação RPA no Windows.

## Estrutura

### Scripts de Instalação
- **install.bat** - Script de instalação principal para Windows
- **install-ses.ps1** - Script PowerShell para configuração do SES (Simple Email Service)

### Arquivos de Configuração
- **windows.base** - Configurações base do sistema
- **windows.boot** - Configurações de inicialização
- **windows.mac** - Configurações de MAC
- **windows.rom** - Configurações de ROM
- **windows.vars** - Variáveis de ambiente
- **windows.ver** - Versão do sistema

### RPA Automation
- **rpa-pyauto/** - Scripts Python para automação RPA
  - `main.py` - Script principal
  - `desktop.py` - Automação de desktop
  - `web.py` - Automação de web
  - `static.py` - Configurações estáticas
  - `utils.py` - Funções utilitárias
  - `requirements.txt` - Dependências Python
  - `rpa.jsonl` - Configurações RPA em JSONL
  - `img/` - Imagens para referência

## Instalação

1. Execute o script de instalação apropriado para seu ambiente:
   ```bash
   install.bat
   ```

2. Para configurações avançadas com PowerShell:
   ```powershell
   .\install-ses.ps1
   ```

## Uso

Para executar a automação RPA:
```bash
cd rpa-pyauto
python main.py
```

## Requisitos

- Python 3.8+
- Windows 10 ou superior
- Dependências listadas em `rpa-pyauto/requirements.txt`

## Configuração

Antes de executar, certifique-se de que:
1. As variáveis de ambiente estão configuradas corretamente (veja `windows.vars`)
2. Os arquivos de configuração base estão presentes
3. Todas as dependências Python foram instaladas
