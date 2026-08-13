# 🔐 SmartCard Service (Acesso Service)

**Microsserviço de Gerenciamento de Acesso por Smart Card** - Integração com leitores de cartão, processamento de eventos de acesso, validação de dados e automação RPA para extração de arquivos.

---

## 📋 Visão Geral

O **smartCard service** é responsável por:
- 🎫 Gerenciamento de eventos de acesso (smart card)
- 📁 Upload e processamento de arquivos Excel
- 🔍 Validação e detecção de inconsistências
- 🤖 Automação RPA para extração de dados (SESClient)
- 🔗 Sincronização com users_service via RabbitMQ
- 📊 APIs REST para consulta de acessos

---

## 🚀 Tech Stack

| Camada | Tecnologias |
|--------|-------------|
| **Framework** | Django 5.2 + Django REST Framework |
| **Database** | PostgreSQL 15+ |
| **Async Tasks** | Celery 5.6.2 + Redis |
| **Message Queue** | RabbitMQ + kombu |
| **File Processing** | pandas 2.3.3, openpyxl 3.1.5 |
| **Fuzzy Matching** | fuzzywuzzy |
| **RPA Automation** | PyAutoGUI |

---

## 📂 Estrutura de Pastas

```
smartCard/
├── rpa-pyauto/                # Automação RPA
│   ├── main.py                # Orquestrador
│   ├── desktop.py             # Automação SESClient
│   ├── web.py                 # Automação web
│   ├── static.py              # Credenciais
│   └── rpa.jsonl              # Logs estruturados
├── smartcard/                 # App Django
│   ├── models.py
│   ├── urlsapi.py
│   ├── tasks.py
│   ├── services.py
│   └── ...
├── core/                      # Config Django
├── docker/                    # Dockerfiles
└── requirements.txt
```

---

## 📊 Modelos de Dados

- **Usuario** - Usuários com matricula única
- **Acesso** - Registros de eventos de acesso com status de validação
- **Processamento** - Rastreamento de tarefas Celery

---

## 🔌 API Endpoints

```http
GET    /api/acesso/usuarios/               # Listar usuários
GET    /api/acesso/apontamento/            # Listar acessos
PATCH  /api/acesso/apontamento/{id}/       # Marcar revisado
POST   /api/acesso/upload-xls/             # Upload de arquivo
GET    /api/acesso/processamento/          # Status de tarefas
```

---

## 🤖 RPA Automation

- **desktop.py** - Extrai arquivos do SESClient (sistema legado)
- **web.py** - Automação de login e upload web
- **main.py** - Orquestrador principal

Categorias suportadas:
- Funcionários
- Alunos
- Prestadores

---

## 📥 Fluxo de Processamento com Integração

```
1. Frontend Upload XLS
   ↓
2. Celery: processar_xls(arquivo, task_id)
   ↓
3. Envia: RabbitMQ 'usuarios_processados' com task_id
   ↓
4. Aguarda: Redis Cache[users_response_{task_id}] (timeout 30s)
   ↓
5. users_service responde em 'usuarios_resposta'
   ↓
6. Consumer thread salva resposta no cache
   ↓
7. processar_xls continua - Parse XLS + Fuzzy Match
   ↓
8. Validação de dados e criação de registros
   ↓
9. Resposta via API para Frontend
```

### Filas RabbitMQ
- **`usuarios_processados`** → Solicitações para users_service
- **`usuarios_resposta`** ← Respostas do users_service

### Consumer Thread em Background

O arquivo `smartcard/tasks.py` inicia automaticamente:
1. Thread daemon que ouve `usuarios_resposta`
2. Callback recebe dados do users_service
3. Salva em Redis: `cache.set(f'users_response_{task_id}', data, timeout=300)`
4. `processar_xls` lê do cache com polling (a cada 2s)

**Timeout**: 30 segundos esperando resposta antes de falhar

---

## 🧪 Instalação

```bash
# Setup local
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Variáveis de ambiente
DEBUG=True
SECRET_KEY=sua-chave
DATABASE_URL=postgresql://user:pass@localhost/smartcard_db
REDIS_URL=redis://localhost:6379/0
RABBITMQ_URL=amqp://guest:guest@localhost:5672//

# Migrações
python manage.py migrate

# Criar superuser
python manage.py createsuperuser

# Rodar servidor
python manage.py runserver 0.0.0.0:8000

# Celery
celery -A core worker -l info
celery -A core beat -l info
```

### 🐳 Docker

```bash
docker build -f docker/backend.Dockerfile -t labacess-smartcard:latest .
docker-compose -f docker/docker-compose.yml up -d
```

---

## 🔍 Validação de Acessos

Status de apontamento:
- **0** - Acesso válido
- **1** - Inconsistência (ex: saída sem entrada)
- **2** - Erro crítico
- **3** - Revisado manualmente

Fuzzy matching (80%+ similaridade):
```python
from fuzzywuzzy import fuzz
score = fuzz.ratio(nome1, nome2)
if score > 80:
    match_found = True
```

---

## 🛡️ Segurança

✅ JWT autenticação  
✅ CORS configurado  
✅ RabbitMQ encryption  
✅ Rate limiting  

---

## 🚀 Deployment

Variáveis de produção:
```env
DEBUG=False
ALLOWED_HOSTS=acesso.api.example.com
DATABASE_URL=postgresql://prod:pass@prod_db/smartcard_prod
REDIS_URL=redis://redis:6379/0
```

---

**Desenvolvido com ❤️ para controle seguro de acesso a laboratórios**
