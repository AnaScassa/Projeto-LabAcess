# Users Service

Microsservico Django responsavel pela identidade e pelos dados de usuarios do LabAcess. O servico gerencia autenticacao JWT, usuarios, perfis, areas de formacao, cargos e treinamentos de seguranca.

Ele tambem fornece uma API interna para o `smartCard` consultar usuarios e perfis durante o processamento de arquivos, usando RabbitMQ para receber solicitacoes e Redis para compartilhar os dados da resposta.

## Responsabilidades

- Autenticar usuarios e emitir tokens JWT.
- Renovar access tokens por meio de refresh tokens.
- Gerenciar usuarios, perfis e informacoes de contato.
- Gerenciar areas de formacao e cargos.
- Registrar treinamentos de seguranca e sessoes em grupo.
- Expor APIs REST protegidas por autenticacao.
- Fornecer endpoints internos para integracao com o `smartCard`.
- Responder consultas do `smartCard` usando RabbitMQ e Redis.
- Inicializar dados padrao por meio do comando `init_users`.

## Tecnologias

| Categoria | Tecnologias |
| --- | --- |
| Framework web | Django 5.2 |
| APIs | Django REST Framework 3.16 |
| Autenticacao | `djangorestframework-simplejwt`, PyJWT e API Keys |
| Modelo de usuario | Django `AbstractUser` customizado |
| Banco de dados | PostgreSQL via `psycopg2-binary` |
| Cache e dados compartilhados | Redis via `django-redis` |
| Mensageria | RabbitMQ via Pika e Kombu |
| Tarefas e resultados | Celery, django-celery-beat e django-celery-results |
| Autenticacao complementar | Django Allauth e `djangorestframework-sso` |
| CORS | `django-cors-headers` |
| Configuracao | `python-dotenv` e `python-decouple` |
| Testes e dados | Faker e factory_boy |
| Containerizacao | Docker e Python 3.12 |

## Estrutura

```text
users_service/
├── users/
│   ├── migrations/           # Migracoes do banco
│   ├── management/           # Comandos Django, incluindo init_users
│   ├── models.py             # Modelos de usuario e treinamentos
│   ├── serializers.py        # Serializadores da API
│   ├── views.py              # ViewSets e autenticacao
│   ├── urls.py               # Rotas da aplicacao
│   ├── api_internal.py       # Endpoints para comunicacao entre servicos
│   ├── tasks.py              # Consumer RabbitMQ em thread daemon
│   ├── factories.py          # Factories para testes
│   └── tests.py              # Testes
├── users_service/
│   ├── settings.py           # Django, PostgreSQL, Redis e JWT
│   ├── urls.py               # Rotas principais
│   ├── celery.py             # Configuracao do Celery
│   ├── middleware.py         # Middleware de requisicoes internas
│   ├── asgi.py               # Entrada ASGI
│   └── wsgi.py               # Entrada WSGI
├── docker/
│   └── users.Dockerfile
├── fixtures/                 # Dados iniciais
├── init.sh                   # Inicializacao do container
├── manage.py
└── requirements.txt
```

## Modelos de dados

- **User**: modelo customizado baseado em `AbstractUser`, com propriedades para nome completo, ultimo projeto, treinamento agendado e usuario MRBS.
- **UserProfile**: perfil um-para-um com o usuario, area de formacao, matricula academica, telefone e contatos de emergencia.
- **DegreeArea**: area de formacao associada ao perfil.
- **Position**: cargo ou posicao do usuario.
- **SafetyTraining**: treinamento individual, com datas de conclusao e expiracao.
- **SafetyTrainingGroup**: sessao de treinamento para varios usuarios, com data, status e participantes.

O modelo configurado como usuario principal do Django e `users.User`, definido em `AUTH_USER_MODEL`.

## API

Todas as rotas da aplicacao ficam sob o prefixo `/api/users/`. A configuracao padrao do Django REST Framework exige autenticacao, exceto endpoints que tenham permissao especifica.

### Autenticacao

| Metodo | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/api/users/api/token/` | Obter access e refresh tokens |
| `POST` | `/api/users/api/token/refresh/` | Renovar o access token |

Use o access token nas chamadas protegidas:

```http
Authorization: Bearer <access-token>
```

### ViewSets

| Metodos | Rota | Finalidade |
| --- | --- | --- |
| `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `/api/users/user/` | Gerenciar usuarios |
| `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `/api/users/user-profile/` | Gerenciar perfis |
| `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `/api/users/safety-training/` | Gerenciar treinamentos |

Os ViewSets usam o router padrao do DRF, portanto tambem oferecem as rotas de detalhe com `/{id}/`.

### Integracao interna

| Metodo | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/api/users/internal/users/` | Listar dados dos usuarios |
| `GET` | `/api/users/internal/profiles/` | Listar dados dos perfis |
| `GET` | `/api/users/internal/all-data/` | Retornar usuarios e perfis |

O middleware `InternalRequestMiddleware` participa da protecao das requisicoes internas. Use essas rotas apenas entre servicos autorizados.

O painel administrativo do Django fica em `/admin2/`.

## Integracao com o SmartCard

O `smartCard` publica uma mensagem na fila `usuarios_processados` contendo o ID da tarefa:

```json
{
  "task_id": "id-da-tarefa"
}
```

O consumer iniciado por `users/tasks.py`:

1. Conecta ao RabbitMQ e aguarda a fila `usuarios_processados`.
2. Le os usuarios e perfis no banco.
3. Salva os dados no Redis com a chave `users_global_{task_id}` durante uma hora.
4. Publica uma resposta na `reply_to` informada na mensagem.
5. Preserva o `correlation_id` para que o `smartCard` associe a resposta a tarefa correta.

Resposta publicada:

```json
{
  "users": "users_id-da-tarefa",
  "profiles": "profiles_id-da-tarefa",
  "status": "success"
}
```

O `smartCard` usa a resposta correlacionada e os dados compartilhados no Redis para continuar o processamento do arquivo.

## Celery

O projeto possui configuracao Celery com Redis como broker e backend de resultados:

```text
Broker: redis://redis:6379/0
Backend: redis://redis:6379/0
```

O container inicia um worker com:

```bash
celery -A users_service worker --loglevel=info
```

A comunicacao especifica com o `smartCard` e feita pelo consumer RabbitMQ de `users/tasks.py`, que e iniciado em uma thread daemon durante a importacao do modulo.

## Configuracao

As configuracoes podem vir de variaveis de ambiente ou de arquivos Docker Secrets em `/run/secrets/`. Os principais valores sao:

```env
DEBUG=True
DB_HOST=postgres
DB_PORT=5432
DB_NAME=users_db
DB_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_ALGORITHM=HS256
```

O JWT usa access token com duracao de 30 minutos e refresh token com duracao de 1 dia. O fuso horario configurado e `America/Sao_Paulo`.

Nao versione secrets reais. Em ambiente Docker, as credenciais sao fornecidas pelo `docker-compose.yml` da raiz do repositorio.

## Execucao local

Na pasta `users_service`:

```bash
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py init_users
python manage.py runserver 0.0.0.0:8000
```

Em Linux ou macOS:

```bash
source venv/bin/activate
```

Para iniciar um worker Celery em outro terminal:

```bash
celery -A users_service worker --loglevel=info
```

A execucao local exige PostgreSQL, Redis e RabbitMQ acessiveis pelas configuracoes do ambiente.

## Docker

O `docker/users.Dockerfile` usa Python 3.12, instala as dependencias e copia o projeto para `/app`. O script `init.sh`:

1. Aguarda o PostgreSQL e o RabbitMQ.
2. Executa `makemigrations` e `migrate`.
3. Executa o comando `init_users`.
4. Inicia o Django em `0.0.0.0:8000`.
5. Inicia o worker Celery.

A partir da raiz do repositorio:

```bash
docker compose up --build users_service
```

Na composicao principal, o servico fica disponivel diretamente em `http://localhost:8001`, pois a porta `8001` do host e mapeada para a porta `8000` do container.

Para subir todos os servicos:

```bash
docker compose up --build
```

## Testes

Execute os testes Django com:

```bash
python manage.py test
```

Configure o banco e os servicos externos exigidos pelo ambiente antes da execucao.

## Seguranca

- Autenticacao JWT para endpoints protegidos.
- Senhas gerenciadas pelo sistema de autenticacao do Django.
- CORS configurado para as origens conhecidas do frontend.
- Secrets lidos de arquivos Docker ou variaveis de ambiente.
- Middleware dedicado para requisicoes internas.
- Permissoes padrao do DRF configuradas como `IsAuthenticated`.
