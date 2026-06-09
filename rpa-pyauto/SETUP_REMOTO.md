# 🎯 RPA Windows - Resumo da Configuração para Servidor Remoto

## ✅ O que foi feito

Seu RPA agora está configurado para rodar no Windows e se conectar ao servidor remoto:
- **Servidor**: http://143.106.5.45:8006/
- **RabbitMQ**: 143.106.5.45:5672

---

## 🚀 Como Iniciar

### Passo 1: Verificar conexão com o servidor

```powershell
python teste_conexao.py
```

Saída esperada:
```
✓ Conexão TCP: OK
✓ Conexão Pika: OK
✓ RabbitMQ está acessível!
✓ TUDO OK! Você pode iniciar o RPA
```

### Passo 2: Iniciar Consumer RPA

**No Terminal 1:**
```powershell
iniciar_consumer.bat
```

Saída esperada:
```
============================================================
CONFIGURAÇÕES RPA
============================================================

🔌 RabbitMQ:
   Host: 143.106.5.45
   Porta: 5672

🌐 Flask:
   Host: 0.0.0.0
   Porta: 8006

Aguardando mensagens do RabbitMQ...
```

### Passo 3: Iniciar API Flask

**No Terminal 2:**
```powershell
iniciar_api.bat
```

Saída esperada:
```
============================================================
CONFIGURAÇÕES RPA
============================================================

Iniciando servidor Flask em http://0.0.0.0:8006
 * Running on http://0.0.0.0:8006
```

---

## 🌐 Acessar a API

A API estará disponível em:

```
http://143.106.5.45:8006/
```

### Exemplos de Requisições

**1. Verificar status de uma tarefa:**
```bash
curl http://143.106.5.45:8006/rpa/status/abc-123-def
```

Resposta:
```json
{
    "task_id": "abc-123-def",
    "status": "concluida",
    "user_id": 5,
    "timestamp_criacao": "2026-06-08T10:30:00",
    "resultado": "RPA executado com sucesso"
}
```

**2. Obter histórico do usuário:**
```bash
curl "http://143.106.5.45:8006/rpa/historico/5?limite=10"
```

**3. Health check:**
```bash
curl http://143.106.5.45:8006/rpa/health
```

---

## 📁 Arquivos Criados/Modificados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.env` | ✨ Criado | Configurações do servidor remoto |
| `config.py` | ✨ Criado | Carrega variáveis de ambiente |
| `iniciaApi.py` | ✏️ Modificado | Usa config.py para conectar |
| `app_flask.py` | ✏️ Modificado | Usa config.py e porta 8006 |
| `requirements.txt` | ✏️ Modificado | Adicionado python-dotenv |
| `iniciar_consumer.bat` | ✨ Criado | Atalho para iniciar consumer (Windows) |
| `iniciar_api.bat` | ✨ Criado | Atalho para iniciar API (Windows) |
| `teste_conexao.py` | ✨ Criado | Verifica conexão com servidor |
| `README_WINDOWS_SETUP.md` | ✨ Criado | Guia de configuração |

---

## 🔧 Configurações do .env

```env
# RabbitMQ no servidor remoto
RABBITMQ_HOST=143.106.5.45
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_QUEUE=rpa_executar

# Flask acessível na porta 8006
FLASK_HOST=0.0.0.0
FLASK_PORT=8006
FLASK_DEBUG=False
```

---

## 🔄 Fluxo Completo

```
Django Microserviço (seu_server)
    ↓ POST /executar_rpa
    ├─ Cria task_id (UUID)
    └─ Envia mensagem para RabbitMQ

        ↓

RabbitMQ (143.106.5.45:5672)
    └─ Fila: rpa_executar

        ↓

Consumer RPA (Windows)
    ├─ Recebe mensagem
    ├─ Registra tarefa como "em_progresso"
    ├─ Executa main() (RPA)
    ├─ Envia arquivo para API
    └─ Marca como "concluida" ou "erro"

        ↓

Armazenamento (tasks_status.json)
    └─ Status da tarefa salvo

        ↑

Django Microserviço (seu_server)
    └─ GET /rpa/status/{task_id}
       ├─ Consulta Flask API
       └─ Retorna status
```

---

## 🐛 Troubleshooting

### ❌ "Conexão recusada" ao RabbitMQ

```powershell
# Testar ping
ping 143.106.5.45

# Testar porta específica
Test-NetConnection 143.106.5.45 -Port 5672
```

**Soluções:**
- Verificar se IP está correto no `.env`
- Verifique firewall do servidor
- Verifique firewall local (Windows)

### ❌ "Porta 8006 já em uso"

Altere no `.env`:
```env
FLASK_PORT=8007
```

### ❌ "Arquivo tasks_status.json corrupto"

```powershell
# Delete e consumer recria automaticamente
Remove-Item tasks_status.json
```

---

## 💡 Dicas

1. **Manter logs visíveis**: Não feche os terminais enquanto testa
2. **Testar localmente primeiro**: Use `RABBITMQ_HOST=localhost` e `FLASK_PORT=5000`
3. **Monitorar tarefas**: Execute `teste_integracao.py` para enviar teste
4. **Banco de dados**: Para produção, migre `tasks_status.json` para PostgreSQL

---

## 📞 Suporte

Se tiver problemas:

1. Execute `teste_conexao.py` para diagnosticar
2. Verifique os logs nos terminais
3. Consulte `README_WINDOWS_SETUP.md` para detalhes

---

## ✨ Próximos Passos

- [ ] Testar com `teste_conexao.py`
- [ ] Iniciar Consumer e API em dois terminais
- [ ] Enviar mensagem de teste do Django
- [ ] Verificar status no endpoint `/rpa/status/{task_id}`
- [ ] Migrar `tasks_status.json` para banco de dados
