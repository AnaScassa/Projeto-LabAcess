# 🚀 RPA no Windows - Configuração para Servidor Remoto

## 📌 Configuração Rápida

### 1️⃣ Instalar Dependências

```powershell
pip install -r requirements.txt
```

### 2️⃣ Configurar Servidor Remoto

Edite o arquivo `.env` na raiz do projeto:

```env
# RabbitMQ no servidor remoto
RABBITMQ_HOST=143.106.5.45
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# API Flask acessível externamente
FLASK_HOST=0.0.0.0
FLASK_PORT=8006
```

### 3️⃣ Iniciar Consumer RPA

**Opção A: Executar pelo arquivo .bat (Windows)**
```powershell
iniciar_consumer.bat
```

**Opção B: Executar pelo terminal**
```powershell
python iniciaApi.py
```

### 4️⃣ Iniciar API Flask (em outro terminal)

**Opção A: Executar pelo arquivo .bat (Windows)**
```powershell
iniciar_api.bat
```

**Opção B: Executar pelo terminal**
```powershell
python app_flask.py
```

---

## 🌐 Acessar a API

Após iniciar, a API estará disponível em:

```
http://143.106.5.45:8006/
```

### Endpoints

**Verificar status do RPA:**
```
GET http://143.106.5.45:8006/rpa/status/{task_id}
```

**Obter histórico do usuário:**
```
GET http://143.106.5.45:8006/rpa/historico/{user_id}?limite=10
```

**Health check:**
```
GET http://143.106.5.45:8006/rpa/health
```

---

## 📂 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `.env` | Configurações (host, porta, RabbitMQ) |
| `iniciaApi.py` | Consumer que recebe mensagens e executa RPA |
| `app_flask.py` | API que consulta status das tarefas |
| `task_manager.py` | Gerencia status das tarefas |
| `config.py` | Carrega configurações do .env |
| `iniciar_consumer.bat` | Atalho para iniciar consumer (Windows) |
| `iniciar_api.bat` | Atalho para iniciar API (Windows) |

---

## 🔍 Verificando Configurações

Ao iniciar, você verá:

```
============================================================
CONFIGURAÇÕES RPA
============================================================

🔌 RabbitMQ:
   Host: 143.106.5.45
   Porta: 5672
   Usuário: guest
   Fila: rpa_executar

🌐 Flask:
   Host: 0.0.0.0
   Porta: 8006
   Debug: False

📁 Geral:
   Arquivo de tarefas: tasks_status.json
   Nível de log: INFO

============================================================
```

---

## 🐛 Troubleshooting

### Erro: "Conexão recusada" ao RabbitMQ
- Verifique se o IP e porta estão corretos no `.env`
- Certifique-se que RabbitMQ está rodando no servidor
- Teste a conexão: `ping 143.106.5.45`

### Erro: "Porta 8006 já em uso"
- Altere a porta no `.env`: `FLASK_PORT=8007`
- Ou encerre o processo que está usando a porta

### API não está acessível
- Verifique se o firewall permite conexões na porta 8006
- Teste localmente: `http://localhost:8006/rpa/health`

---

## 📊 Fluxo de Execução

```
Django (seu_servidor:8000)
    ↓ Envia mensagem
RabbitMQ (143.106.5.45:5672)
    ↓ Queue rpa_executar
Consumer RPA (Windows)
    ├─ Recebe mensagem
    ├─ Executa main() (RPA)
    ├─ Atualiza status
    └─ Salva em tasks_status.json
    
Flask API (143.106.5.45:8006)
    ↑ Django consulta status
    └─ Retorna JSON com resultado
```

---

## 🚀 Iniciar Automaticamente no Boot (Windows)

Para que o RPA inicie automaticamente quando o Windows bootar:

1. Pressione `Win + R`
2. Digite: `shell:startup`
3. Crie um atalho para `iniciar_consumer.bat` nessa pasta

Ou use Agendador de Tarefas do Windows.

---

## 📝 Notas

- As tarefas são salvas em `tasks_status.json` (JSON simples)
- Para produção, migre para um banco de dados real
- O consumer processa uma mensagem por vez (prefetch_count=1)
- Mensagens com erro são recolocadas na fila automaticamente
