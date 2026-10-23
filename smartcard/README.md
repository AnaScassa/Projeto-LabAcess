# SmartCard Service

Backend Django responsavel pelo gerenciamento e processamento de registros de acesso do LabAcess. O servico recebe arquivos XLS/CSV, identifica usuarios, valida eventos de entrada e saida, registra os acessos no PostgreSQL e disponibiliza APIs para o frontend.

O SmartCard tambem coordena tarefas assincronas com Celery, consulta dados do `users_service` por RabbitMQ e Redis, publica eventos de processamento por Server-Sent Events (SSE) e envia notificacoes sobre usos indevidos de cartao.

## Responsabilidades

- Expor a API REST de acessos, usuarios, apontamentos e processamento.
- Receber e processar arquivos `.xls` e `.csv`.
- Associar registros de acesso a usuarios por matricula.
- Identificar inconsistencias em eventos de entrada e saida.
- Aplicar regras para acessos de alunos fora do horario permitido, fins de semana e feriados.
- Consultar perfis e usuarios no `users_service`.
- Persistir acessos, usuarios, tarefas e e-mails no PostgreSQL.
- Disponibilizar status de tarefas e eventos em tempo real.
- Solicitar ao RPA a busca de registros no SESClient.
- Notificar e-mails cadastrados quando um uso indevido e detectado.

## Tecnologias

| Categoria | Tecnologias |
| --- | --- |
| Framework web | Django 5.2 |
| APIs | Django REST Framework 3.16 |
| Autenticacao | JWT Stateless, Simple JWT, PyJWT e API Keys |
| Banco de dados | PostgreSQL, `psycopg2-binary` |
| Cache e eventos | Redis, `django-redis` e Redis Pub/Sub |
| Tarefas assincronas | Celery, django-celery-beat e django-celery-results |
| Mensageria | RabbitMQ via Pika e Kombu |
| Planilhas | Pandas, OpenPyXL e xlrd |
| Comparacao de texto | FuzzyWuzzy, TheFuzz, RapidFuzz e python-Levenshtein |
| Configuracao | python-dotenv e python-decouple |
| E-mail | SMTP Gmail e MailHog em desenvolvimento |
| Containerizacao | Docker, Docker Compose e Python 3.12 |

## Estrutura

```text
smartCard/
├── core/
│   ├── settings.py       # Configuracoes Django, banco, Redis e Celery
│   ├── urls.py           # Rotas principais do projeto
│   ├── celery.py         # Configuracao do Celery
│   ├── asgi.py           # Entrada ASGI
│   └── wsgi.py           # Entrada WSGI
├── smartcard/
│   ├── models.py         # Modelos de usuarios, acessos, tarefas e e-mails
│   ├── serializers.py    # Serializadores da API
│   ├── api.py            # ViewSets REST
│   ├── views.py          # Views e endpoints adicionais
│   ├── urlsapi.py        # Rotas da API de acesso
│   ├── tasks.py          # Tarefas Celery de processamento
│   ├── services.py       # Regras e servicos de dominio
│   ├── auth.py           # Recursos de autenticacao
│   ├── receber_resposta.py # Consumo de respostas do RPA
│   ├── rabbitmq/         # Integracoes auxiliares com RabbitMQ
│   ├── migrations/       # Migracoes do banco
│   └── tests/            # Testes
├── docker/
│   └── backend.Dockerfile
├── fixtures/              # Dados iniciais
├── media/                 # Arquivos enviados
├── init.sh                # Inicializacao do container
├── manage.py
└── requirements.txt
```

O RPA Windows esta em `windows/rpa-pyauto/`, fora deste servico. Ele controla o SESClient e se comunica com o SmartCard por RabbitMQ.

## Modelos principais

- **Usuario**: matricula, nome, categoria e vinculo opcional com o usuario autenticado.
- **Acesso**: usuario, data/hora, evento, area, leitor, entrada/saida e apontamento de validacao.
- **Processamento**: task ID, status, usuario solicitante, tarefa pai e timestamps de criacao/atualizacao.
- **Emails**: enderecos cadastrados para receber notificacoes, com controle de ativacao.

Os status de `Processamento` incluem `PENDING`, `PROCESSANDO`, `SUCCESS` e `ERRO`.

## API

As rotas abaixo sao expostas sob o prefixo `/api/acesso/` e exigem autenticacao JWT, salvo os casos previstos pela configuracao de API Key.

### ViewSets REST

| Metodo | Rota | Finalidade |
| --- | --- | --- |
| `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `/groups/` | Grupos |
| `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `/acessos/` | Registros de acesso |
| `GET` | `/usuarios/` | Usuarios |
| `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `/processamento/` | Tarefas de processamento |
| `GET` | `/apontamento/` | Registros com apontamento |

### Endpoints adicionais

| Metodo | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/upload-xls/` | Receber arquivo XLS ou CSV |
| `GET` | `/lista-usuarios/` | Listar usuarios |
| `PATCH` | `/desativar-apontamento/{id}/` | Alterar apontamento |
| `POST` | `/buscar-registro/` | Solicitar busca de registros |
| `GET` | `/usuarios-ativos` | Listar usuarios ativos |
| `GET` | `/emails` | Eventos de notificacao por SSE |
| `GET` | `/lista-emails` | Listar e-mails cadastrados |
| `PATCH` | `/desativar-emails/{id}/` | Desativar e-mail |
| `POST` | `/cadastrar-email/` | Cadastrar e-mail |
| `POST` | `/registrar-email/` | Registrar e-mail |
| `GET` | `/receber-resposta/` | Eventos SSE das respostas do RPA |
| `POST` | `/verificar-id/{id}/` | Verificar processamento do usuario |
| `GET` | `/ultima-resposta/` | Consultar a ultima resposta do RPA |

A rota `/authorize/` fica no projeto principal e e usada para autorizacao. O endpoint administrativo do Django fica em `/admin/`.

## Fluxo de upload e processamento

1. O frontend envia um arquivo para `/api/acesso/upload-xls/`.
2. O backend cria um registro de `Processamento` e agenda uma tarefa Celery na fila `fila_rapida`.
3. A tarefa solicita ao `users_service` os dados de usuarios e perfis pela fila `usuarios_processados`.
4. O backend aguarda a resposta correlacionada por até 30 segundos.
5. O arquivo e lido com Pandas: XLS com OpenPyXL ou CSV separado por `;`.
6. Cada linha e associada a um usuario e transformada em um registro `Acesso`.
7. Regras de horario, feriados, entrada/saida e inconsistencias atualizam o apontamento.
8. Os dados sao salvos no PostgreSQL e o status da tarefa e atualizado.
9. O frontend acompanha o processamento pelo endpoint SSE `/processamento/`.

## Integracao com users_service

A comunicacao usa RabbitMQ com correlation ID e reply queue temporaria:

- `usuarios_processados`: solicitacao de usuarios e perfis para uma tarefa.
- `usuarios_resposta`: resposta do `users_service` quando aplicavel.
- `users_global_{task_id}`: dados compartilhados no Redis para a tarefa.
- Timeout da consulta: 30 segundos.

## Integracao com o RPA

O endpoint `/buscar-registro/` solicita uma busca no RPA Windows. O RPA acessa o SESClient, exporta os registros e publica o resultado no RabbitMQ. O modulo `receber_resposta.py` registra a ultima resposta no Redis com status, quantidade e data de criacao.

A resposta final normalmente possui este formato:

```json
{
  "status": "finalizado",
  "quantidade": 42,
  "criado_em": "2026-09-02T12:00:00-03:00"
}
```

O frontend consulta essa resposta em `/ultima-resposta/` ou recebe a atualizacao pelo SSE `/receber-resposta/`.

## Validacao de acessos

O campo `apontamento` e usado para indicar o resultado da validacao. O valor padrao e `0`, e eventos fora das regras de acesso recebem `1`. Entre as verificacoes implementadas estao:

- Evento diferente de `Apontamento Normal`.
- Acesso ou saida de aluno fora do horario permitido.
- Acesso de aluno em fim de semana ou feriado fixo.
- Inconsistencias entre entradas e saidas.

Quando um uso indevido ocorre na data atual, o servico envia uma notificacao para os e-mails ativos usando Gmail e MailHog e publica o evento no Redis.

## Configuracao

O servico le configuracoes de variaveis de ambiente e, no Docker, de arquivos montados em `/run/secrets/`. Os principais valores sao:

```env
DEBUG=True
DB_HOST=postgres
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_ALGORITHM=HS256
EMAIL_HOST_USER=usuario@example.com
EMAIL_HOST_PASSWORD=senha-de-aplicacao
```

Nao versione secrets reais. Em ambiente Docker, o `docker-compose.yml` da raiz fornece PostgreSQL, Redis, RabbitMQ e MailHog.

## Execucao local

Na pasta `smartCard`:

```bash
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8080
```

Em Linux ou macOS, ative o ambiente com:

```bash
source venv/bin/activate
```

Para executar o worker Celery localmente:

```bash
celery -A core worker --pool=solo --concurrency=1 --loglevel=info -Q fila_rapida,fila_media,fila_pesada
```

A execucao local exige PostgreSQL, Redis e RabbitMQ acessiveis com os hosts e portas definidos nas variaveis de ambiente.

## Docker

O `docker/backend.Dockerfile` usa Python 3.12, instala `requirements.txt` e copia o projeto para `/app`. O script `init.sh` aguarda PostgreSQL, Redis e RabbitMQ, executa migrations, inicia o Django em `0.0.0.0:8080` e inicia o worker Celery.

A partir da raiz do repositorio:

```bash
docker compose up --build backend
```

Para subir toda a plataforma, incluindo frontend, `users_service`, Kong e dependencias:

```bash
docker compose up --build
```

O backend fica exposto diretamente em `http://localhost:8080` e, na arquitetura completa, a API publica normalmente entra pelo Kong em `http://localhost:8000`.

## Testes

Execute os testes Django com:

```bash
python manage.py test
```

Antes de executar, configure o banco de dados e os servicos externos exigidos pelo ambiente de teste.
