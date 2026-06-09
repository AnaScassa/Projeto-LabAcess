# Integração RPA com RabbitMQ e Django

## 📋 Arquitetura

```
Django Microserviço
    ↓
    └─→ RabbitMQ (fila: rpa_executar)
         ↓
    Consumer RPA (iniciaApi.py)
         ├─→ Executa RPA (desktop.py)
         ├─→ Envia arquivo (api.py)
         └─→ Armazena status (task_manager.py)
         
Flask API (app_flask.py)
    ↑
    └─← Django consulta status
```

## 🚀 Como Executar

### 1️⃣ **Instalar dependências**
```powershell
pip install -r requirements.txt
```

### 2️⃣ **Terminal 1: Iniciar Consumer RPA**
```powershell
python iniciaApi.py
```

Output esperado:
```
2026-06-08 10:30:00 - INFO - Aguardando mensagens do RabbitMQ...
```

### 3️⃣ **Terminal 2: Iniciar API Flask** (opcional, para consultar status)
```powershell
python app_flask.py
```

Output esperado:
```
WARNING in app.run (app.py:1234): This is a development server. Do not use it in production.
 * Running on http://0.0.0.0:5000
```

## 📊 Fluxo Completo

### Seu Django envia:
```python
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def executar_rpa(request):
    rpa_uuid = str(uuid.uuid4())
    
    enviar_mensagem("rpa_executar", {
        "task_id": rpa_uuid,
        "user_id": request.user.id,
        "timestamp": str(__import__('django.utils.timezone', fromlist=['now']).now())
    })
    
    return Response({
        "status": "RPA iniciado",
        "task_id": rpa_uuid,
    }, status=status.HTTP_202_ACCEPTED)
```

### Consumer RPA recebe e processa:
```
1. Recebe mensagem com task_id, user_id, timestamp
2. Registra tarefa como "em_progresso"
3. Executa main() (RPA)
4. Envia arquivo para API
5. Marca tarefa como "concluida" ou "erro"
```

### Seu Django consulta o status:
```python
GET /rpa/status/{task_id}/
```

Resposta:
```json
{
    "status": "concluida",
    "task_id": "abc-123-def",
    "user_id": 5,
    "timestamp_criacao": "2026-06-08T10:30:00",
    "timestamp_inicio": "2026-06-08T10:31:00",
    "timestamp_conclusao": "2026-06-08T10:35:00",
    "resultado": "RPA executado com sucesso",
    "erro": null
}
```

## 🔌 Endpoints da API Flask

### 1. Obter status de uma tarefa
```
GET /rpa/status/<task_id>
```

**Resposta (200):**
```json
{
    "task_id": "uuid-123",
    "status": "concluida",
    "user_id": 5,
    "timestamp_criacao": "...",
    "timestamp_inicio": "...",
    "timestamp_conclusao": "...",
    "resultado": "RPA executado com sucesso",
    "erro": null
}
```

**Resposta (404):**
```json
{
    "erro": "Tarefa não encontrada",
    "task_id": "uuid-123"
}
```

---

### 2. Obter histórico de tarefas de um usuário
```
GET /rpa/historico/<user_id>?limite=10
```

**Resposta (200):**
```json
{
    "user_id": 5,
    "total": 3,
    "tarefas": [
        {
            "task_id": "uuid-1",
            "status": "concluida",
            "timestamp_criacao": "...",
            "resultado": "..."
        },
        {
            "task_id": "uuid-2",
            "status": "em_progresso",
            "timestamp_criacao": "...",
            "resultado": null
        }
    ]
}
```

---

### 3. Health Check
```
GET /rpa/health
```

**Resposta:**
```json
{
    "status": "ok",
    "servico": "RPA Consumer"
}
```

## 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `iniciaApi.py` | **Consumer RPA** - Consome mensagens e executa RPA |
| `task_manager.py` | **Gerenciador de Tarefas** - Armazena status em JSON |
| `app_flask.py` | **API Flask** - Endpoints para consultar status |
| `django_integration_example.py` | **Exemplo Django** - Como integrar no seu Django |
| `tasks_status.json` | **Armazenamento** - Status das tarefas (criado automaticamente) |

## 🔄 Possíveis Status

| Status | Significado |
|--------|-----------|
| `em_progresso` | RPA está sendo executado |
| `concluida` | RPA foi executado com sucesso |
| `erro` | Erro durante a execução |

## 🐳 Docker Compose (Opcional)

Se estiver usando Docker, aqui está um exemplo:

```yaml
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3.12-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest

  rpa-consumer:
    build: .
    depends_on:
      - rabbitmq
    environment:
      RABBITMQ_HOST: rabbitmq
    volumes:
      - ./rpa-pyauto:/app
    command: python iniciaApi.py

  rpa-api:
    build: .
    depends_on:
      - rabbitmq
    ports:
      - "5000:5000"
    environment:
      RABBITMQ_HOST: rabbitmq
    volumes:
      - ./rpa-pyauto:/app
    command: python app_flask.py
```

## 🔒 Segurança

- O `TaskManager` armazena dados em JSON (desenvolvimento)
- Para produção, migre para banco de dados (PostgreSQL, MongoDB, etc.)
- Adicione autenticação nos endpoints da API Flask
- Valide o `user_id` antes de retornar dados

## 🐛 Troubleshooting

**Erro: "Não conseguiu conectar ao RabbitMQ"**
- RabbitMQ não está rodando
- Verifique se está em localhost:5672 (local) ou rabbitmq:5672 (Docker)

**Erro: "Tarefa não encontrada"**
- O `task_id` não existe ou foi limpo
- Verifique se o consumer recebeu a mensagem nos logs

**Arquivo `tasks_status.json` corrompido**
- Delete o arquivo: `del tasks_status.json`
- Consumer recriará automaticamente na próxima execução

## 📝 Próximos Passos

1. ✅ Implementar banco de dados (SQLite, PostgreSQL)
2. ✅ Adicionar autenticação JWT na API Flask
3. ✅ Implementar webhook para notificar Django quando RPA terminar
4. ✅ Adicionar métricas e monitoramento
5. ✅ Criar dashboard de monitoramento
