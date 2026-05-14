# 👥 Users Service

**Microserviço de Gerenciamento de Usuários e Autenticação** - Responsável por autenticação JWT, gerenciamento de perfis de usuários, controle de treinamentos de segurança e cache distribuído.

---

## 📋 Visão Geral

O **users_service** é um microsserviço crítico que fornece:
- 🔐 Autenticação JWT segura
- 👤 Gerenciamento de perfis de usuários
- 🎓 Rastreamento de treinamentos de segurança
- 💾 Cache distribuído com Redis
- 🔄 Processamento assíncrono com Celery
- 🗣️ Comunicação inter-serviço via RabbitMQ

---

## 🚀 Tech Stack

| Camada | Tecnologias |
|--------|-------------|
| **Framework** | Django 5.2 + Django REST Framework |
| **Autenticação** | JWT (djangorestframework-simplejwt), Django Allauth |
| **Database** | PostgreSQL 15+ |
| **Cache** | Redis 7+ |
| **Task Queue** | Celery 5.6.2 + Redis broker |
| **Message Queue** | RabbitMQ + kombu |
| **Scheduled Jobs** | Django Celery Beat |
| **CORS** | django-cors-headers |

---

## 📂 Estrutura de Pastas

```
users_service/
├── users/                      # App principal
│   ├── migrations/
│   ├── management/
│   ├── rabbitmq/
│   ├── tests/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── api_internal.py
│   ├── tasks.py
│   └── ...
├── users_service/             # Config Django
│   ├── settings.py
│   ├── urls.py
│   ├── celery.py
│   └── ...
├── docker/                    # Dockerfiles
├── fixtures/                  # Dados iniciais
└── requirements.txt
```

---

## 📊 Modelos de Dados

- **User** - Extended AbstractUser com full_name e dados de projeto
- **UserProfile** - Perfil estendido com degree_area e dados de emergência
- **SafetyTraining** - Registros de treinamento com datas de expiração
- **SafetyTrainingGroup** - Sessões de treinamento em grupo

---

## 🔌 API Endpoints

```http
POST   /api/token/               # Obter JWT token
POST   /api/token/refresh/       # Renovar token
GET    /user/                    # Listar usuários
POST   /user/                    # Criar usuário
GET    /safety-training/         # Listar treinamentos
GET    /internal/users/          # APIs internas
```

---

## 🔐 Autenticação JWT

- Access Token: 30 minutos
- Refresh Token: 1 dia
- Headers: `Authorization: Bearer <token>`

---

## ⚙️ Celery & Async

- **Broker**: Redis
- **Queue**: `fila_users`
- **Task**: `processar_usuarios` - Processa requisições do smartCard e retorna dados de usuários

---

## 🔄 RabbitMQ Integration

### Filas de Comunicação
- **`usuarios_processados`** ← Recebe solicitações do smartCard
- **`usuarios_resposta`** → Envia dados de usuários para smartCard

### Fluxo de Processamento

```
1. smartCard envia mensagem em 'usuarios_processados'
   ↓
2. Consumer thread em tasks.py dispara Celery
   ↓
3. processar_usuarios(task_id) executa:
   - Lê User.objects.all()
   - Lê UserProfile.objects.all()
   - Publica resposta em 'usuarios_resposta'
   ↓
4. smartCard consome e salva no cache Redis
```

### Consumer em Thread Background

O arquivo `users/tasks.py` inicia automaticamente uma thread daemon que:
1. Conecta ao RabbitMQ
2. Ouve a fila `usuarios_processados`
3. Para cada mensagem recebida, dispara `processar_usuarios.delay(task_id)`
4. A tarefa Celery executa assincronamente

**Não bloqueia** a importação do módulo - usa threading!

---

## 🧪 Instalação

```bash
# Setup local
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Variáveis de ambiente
DEBUG=True
SECRET_KEY=sua-chave-secreta
DATABASE_URL=postgresql://user:pass@localhost/users_db
REDIS_URL=redis://localhost:6379/0

# Migrações
python manage.py migrate

# Criar superuser
python manage.py createsuperuser

# Rodar servidor
python manage.py runserver 0.0.0.0:8001

# Em outro terminal - Celery
celery -A users_service worker -l info
celery -A users_service beat -l info
```

### 🐳 Docker

```bash
docker build -f docker/users.Dockerfile -t labacess-users:latest .
docker-compose up -d users
```

---

## 🛡️ Segurança

✅ JWT com assinatura segura  
✅ Senhas hasheadas (PBKDF2)  
✅ CORS configurado  
✅ Rate limiting  
✅ SQL Injection prevention  

---

## 🚀 Deployment

Variáveis de produção em `.env`:
```env
DEBUG=False
ALLOWED_HOSTS=users.api.example.com
SECRET_KEY=<gerado>
DATABASE_URL=postgresql://prod:pass@prod_db:5432/users_db_prod
```

---

**Desenvolvido com ❤️ para autenticação segura em microsserviços**
