import json
import os
from datetime import datetime
from jsonFormatter import logger

TASKS_FILE = "tasks_status.json"

class TaskManager:
    """Gerencia o status das tarefas do RPA"""
    
    @staticmethod
    def inicializar():
        """Inicializa arquivo de tarefas se não existir"""
        if not os.path.exists(TASKS_FILE):
            with open(TASKS_FILE, 'w') as f:
                json.dump({}, f)
    
    @staticmethod
    def registrar_tarefa(task_id, user_id, timestamp):
        """Registra uma nova tarefa como iniciada"""
        try:
            with open(TASKS_FILE, 'r') as f:
                tasks = json.load(f)
            
            tasks[task_id] = {
                "status": "em_progresso",
                "user_id": user_id,
                "timestamp_criacao": timestamp,
                "timestamp_inicio": datetime.now().isoformat(),
                "timestamp_conclusao": None,
                "resultado": None,
                "erro": None
            }
            
            with open(TASKS_FILE, 'w') as f:
                json.dump(tasks, f, indent=2)
            
            logger.info(f"Tarefa {task_id} registrada para usuário {user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao registrar tarefa: {e}")
    
    @staticmethod
    def marcar_como_concluida(task_id, resultado=None):
        """Marca uma tarefa como concluída com sucesso"""
        try:
            with open(TASKS_FILE, 'r') as f:
                tasks = json.load(f)
            
            if task_id in tasks:
                tasks[task_id]["status"] = "concluida"
                tasks[task_id]["timestamp_conclusao"] = datetime.now().isoformat()
                tasks[task_id]["resultado"] = resultado or "RPA executado com sucesso"
                
                with open(TASKS_FILE, 'w') as f:
                    json.dump(tasks, f, indent=2)
                
                logger.info(f"Tarefa {task_id} marcada como concluída")
            else:
                logger.warning(f"Tarefa {task_id} não encontrada")
                
        except Exception as e:
            logger.error(f"Erro ao marcar tarefa como concluída: {e}")
    
    @staticmethod
    def marcar_como_erro(task_id, mensagem_erro):
        """Marca uma tarefa como erro"""
        try:
            with open(TASKS_FILE, 'r') as f:
                tasks = json.load(f)
            
            if task_id in tasks:
                tasks[task_id]["status"] = "erro"
                tasks[task_id]["timestamp_conclusao"] = datetime.now().isoformat()
                tasks[task_id]["erro"] = mensagem_erro
                
                with open(TASKS_FILE, 'w') as f:
                    json.dump(tasks, f, indent=2)
                
                logger.error(f"Tarefa {task_id} marcada como erro: {mensagem_erro}")
            else:
                logger.warning(f"Tarefa {task_id} não encontrada")
                
        except Exception as e:
            logger.error(f"Erro ao marcar tarefa como erro: {e}")
    
    @staticmethod
    def obter_tarefa(task_id):
        """Obtém informações de uma tarefa"""
        try:
            with open(TASKS_FILE, 'r') as f:
                tasks = json.load(f)
            
            return tasks.get(task_id, None)
            
        except Exception as e:
            logger.error(f"Erro ao obter tarefa: {e}")
            return None
    
    @staticmethod
    def obter_tarefas_usuario(user_id, limite=10):
        """Obtém últimas tarefas de um usuário"""
        try:
            with open(TASKS_FILE, 'r') as f:
                tasks = json.load(f)
            
            tarefas_user = [
                {"task_id": k, **v}
                for k, v in tasks.items()
                if v.get("user_id") == user_id
            ]
            
            # Ordena pela mais recente
            tarefas_user.sort(
                key=lambda x: x.get("timestamp_criacao", ""),
                reverse=True
            )
            
            return tarefas_user[:limite]
            
        except Exception as e:
            logger.error(f"Erro ao obter tarefas do usuário: {e}")
            return []
