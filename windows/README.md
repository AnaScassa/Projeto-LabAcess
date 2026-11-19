# SESClient Desktop RPA

Automacao RPA para Windows que controla o SESClient, realiza consultas de registros de acesso e envia os arquivos CSV gerados para o restante da plataforma LabAcess.

O robô funciona de forma independente do Docker Compose. Ele precisa executar em uma sessão Windows com o SESClient instalado e acessível, pois a automação depende de teclado, mouse, janelas e imagens da tela.

## Responsabilidades

- Abrir e autenticar no SESClient.
- Executar buscas de registros para o período solicitado.
- Executar automaticamente uma busca periódica dos registros recentes.
- Localizar os CSVs gerados pelo SESClient.
- Contar os registros encontrados.
- Codificar os arquivos em Base64.
- Publicar arquivos CSV via AMQP e status, heartbeat e erros via MQTT no RabbitMQ.
- Remover os CSVs temporários após o envio.
- Registrar a execução em `rpa.jsonl`.

## Tecnologias

| Categoria | Tecnologias |
| --- | --- |
| Linguagem | Python |
| Automação desktop | PyAutoGUI, PyGetWindow, PyScreeze, PyMsgBox, MouseInfo, PyRect e PyTweening |
| Visao computacional | OpenCV e Pillow |
| Mensageria | RabbitMQ via Paho MQTT e Pika/AMQP |
| Agendamento | APScheduler |
| HTTP | Requests |
| Configuracao | python-dotenv e Infisical Python |
| Logs | Logger customizado com formato JSONL |
| Sistema operacional | Windows |
| Aplicacao automatizada | SESClient |

## Estrutura

```text
rpa-pyauto/
├── img/                  # Imagens usadas para localizar elementos na tela
├── buscar_registro.py    # Consumer MQTT das solicitacoes de busca
├── config.py             # Variaveis de configuracao e ambiente
├── csv_utils.py          # Localizacao, contagem e envio dos CSVs
├── desktop.py            # Automacao do SESClient
├── install.bat           # Instalacao auxiliar do ambiente Windows
├── jsonFormatter.py      # Logger estruturado
├── main.py               # Orquestrador do RPA
├── publisher.py          # Publicacao de mensagens RabbitMQ
├── static.py             # Caminhos e valores estaticos da automacao
├── requirements.txt      # Dependencias Python
└── rpa.jsonl             # Logs estruturados da execucao
```

## Funcionamento

O processo principal em `main.py` inicia duas atividades em paralelo:

1. **Agendamento**: `APScheduler` executa `executar_rpa` a cada cinco minutos.
2. **Busca sob demanda**: uma thread consome o tópico MQTT `smartcard/rpa/buscar`, coloca a mensagem em uma fila local e executa a busca solicitada.

Um `Lock` impede que duas execucoes do RPA ocorram simultaneamente. Ao iniciar uma execução, o robô:

1. Entra no SESClient e realiza a consulta.
2. Procura os três CSVs mais recentes na pasta configurada.
3. Soma as linhas dos CSVs, ignorando o cabecalho.
4. Publica cada arquivo na fila AMQP `csvs` em Base64.
5. Publica o status `finalizado` no tópico MQTT `smartcard/rpa/status`.
6. Exclui os arquivos temporarios.

Falhas sao registradas no console e a execucao libera o lock para permitir uma nova tentativa.

## Tópicos MQTT e fila AMQP

| Transporte | Nome | Direcao | Conteudo |
| --- | --- | --- | --- |
| MQTT | `smartcard/rpa/buscar` | Entrada | Parametros de uma busca sob demanda |
| AMQP | `csvs` | Saida | Arquivos CSV codificados em Base64 |
| MQTT | `smartcard/rpa/status` | Saida | Status e quantidade total de registros |
| MQTT | `smartcard/rpa/heartbeat` | Saida | Sinal de atividade do RPA |
| MQTT | `smartcard/rpa/errors` | Saida | Mensagens de erro do RPA |

### Mensagem MQTT de entrada

O tópico `smartcard/rpa/buscar` recebe um JSON com as datas e horarios da consulta:

```json
{
  "data_inicio": "DDMMYYYY",
  "hora_inicio": "HHMM",
  "data_fim": "DDMMYYYY",
  "hora_fim": "HHMM"
}
```

### Mensagem AMQP de arquivo

Para cada CSV, o RPA mantém a publicação AMQP na fila `csvs`:

```json
{
  "nome": "arquivo.csv",
  "conteudo": "<conteudo-em-base64>"
}
```

### Mensagem MQTT de encerramento

Ao concluir a busca, publica no tópico `smartcard/rpa/status`:

```json
{
  "status": "finalizado",
  "total_linhas": 42
}
```

## Configuracao

As configuracoes sao carregadas por `python-dotenv`. O arquivo `config.py` define estes valores:

```env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USER=guest
MQTT_PASSWORD=guest
MQTT_CLIENT_ID=rpa-sesclient
FLASK_HOST=0.0.0.0
FLASK_PORT=8006
LOG_LEVEL=INFO
TASKS_FILE=tasks_status.json
```

O RPA usa MQTT (`MQTT_HOST`/`MQTT_PORT`/`MQTT_USER`/`MQTT_PASSWORD`) para comandos e status e AMQP (`RABBITMQ_HOST`/`RABBITMQ_PORT`/`RABBITMQ_USER`/`RABBITMQ_PASSWORD`) apenas para enviar arquivos CSV. Configure o host e as credenciais para apontar ao mesmo RabbitMQ usado pelo SmartCard.

O caminho dos CSVs e outras constantes da automacao ficam em `static.py`. A pasta precisa conter os arquivos gerados pelo SESClient e as imagens de referencia usadas pelo PyAutoGUI.

Nao versione credenciais ou secrets reais. Use o arquivo `.env` local, que ja esta listado no `.gitignore` do RPA.

## Requisitos do Windows

- Windows 10 ou superior.
- Python instalado e disponivel no PATH.
- SESClient instalado e configurado.
- RabbitMQ acessivel nas portas MQTT `1883` e AMQP `5672`.
- Sessao Windows desbloqueada durante a automacao.
- Resolucao e escala de tela compatíveis com as imagens em `img/`.
- Permissao para ler e remover os CSVs gerados.

Os scripts de instalacao gerais do ambiente ficam em `windows/`. Consulte [windows/README.md](../README.md) para a preparacao do Windows.

## Instalacao

Na pasta `windows/rpa-pyauto`, crie um ambiente virtual e instale as dependencias:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

O arquivo `install.bat` pode ser usado quando a instalacao automatica do ambiente for necessaria. Execute-o conforme as instrucoes do proprio script e as politicas da maquina Windows.

## Execucao

Com o SESClient preparado e o ambiente virtual ativo:

```powershell
python main.py
```

O processo permanece em execucao, aguardando mensagens da fila `buscar` e executando o agendamento periódico. Para encerrar, interrompa o processo no terminal com `Ctrl+C`.

## Imagens de referencia

O arquivo `desktop.py` usa imagens para localizar botoes e elementos do SESClient. Mantenha em `img/` as referencias esperadas pelo codigo e evite alterar sua escala sem atualizar os arquivos de imagem.

A automacao de tela e sensivel a resolucao, escala do Windows, posicao das janelas, estado do SESClient e tempo de carregamento da interface.

## Logs

As mensagens sao gravadas em `rpa.jsonl` em formato JSON Lines. Cada linha representa um evento independente e pode ser processada por ferramentas de observabilidade.

Exemplo:

```json
{"time": "2026-09-02 15:30:22", "level": "INFO", "message": "Login realizado com sucesso"}
```

## Solucao de problemas

- **Nenhum CSV encontrado**: verifique a pasta definida em `static.py` e se o SESClient concluiu a exportacao.
- **RabbitMQ inacessivel**: confirme host, porta, credenciais e a conectividade da maquina Windows.
- **Elemento nao localizado**: confira a resolucao, escala da tela e as imagens em `img/`.
- **Execucao duplicada**: o lock evita concorrencia; aguarde a execucao atual terminar.
- **Quantidade incorreta**: confirme se os CSVs possuem cabecalho e separador `;`, pois a contagem ignora a primeira linha.
