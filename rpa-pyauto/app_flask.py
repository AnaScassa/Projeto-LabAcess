from flask import Flask, request, jsonify
from task_manager import TaskManager
from jsonFormatter import logger
from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG, exibir_config

app = Flask(__name__)

@app.route('/rpa/status/<task_id>', methods=['GET'])
def obter_status_tarefa(task_id):
    """
    Endpoint para consultar o status de uma tarefa RPA
    
    Uso: GET /rpa/status/{task_id}
    
    Resposta:
    {
        "status": "concluida|em_progresso|erro",
        "task_id": "uuid",
        "user_id": 123,
        "timestamp_criacao": "2026-06-08T10:30:00",
        "timestamp_inicio": "2026-06-08T10:31:00",
        "timestamp_conclusao": "2026-06-08T10:35:00",
        "resultado": "RPA executado com sucesso",
        "erro": null
    }
    """
    try:
        tarefa = TaskManager.obter_tarefa(task_id)
        
        if tarefa is None:
            return jsonify({
                "erro": "Tarefa não encontrada",
                "task_id": task_id
            }), 404
        
        return jsonify({
            "task_id": task_id,
            **tarefa
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter status da tarefa: {e}")
        return jsonify({
            "erro": f"Erro ao obter status: {str(e)}"
        }), 500


@app.route('/rpa/historico/<int:user_id>', methods=['GET'])
def obter_historico_usuario(user_id):
    """
    Endpoint para consultar histórico de tarefas de um usuário
    
    Uso: GET /rpa/historico/{user_id}
    Query params:
        - limite: número máximo de tarefas a retornar (padrão: 10)
    
    Resposta:
    {
        "user_id": 123,
        "total": 5,
        "tarefas": [
            {
                "task_id": "uuid",
                "status": "concluida",
                ...
            }
        ]
    }
    """
    try:
        limite = request.args.get('limite', 10, type=int)
        tarefas = TaskManager.obter_tarefas_usuario(user_id, limite=limite)
        
        return jsonify({
            "user_id": user_id,
            "total": len(tarefas),
            "tarefas": tarefas
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter histórico: {e}")
        return jsonify({
            "erro": f"Erro ao obter histórico: {str(e)}"
        }), 500


@app.route('/rpa/health', methods=['GET'])
def health_check():
    """Verifica se o serviço está rodando"""
    return jsonify({
        "status": "ok",
        "servico": "RPA Consumer"
    }), 200


@app.errorhandler(404)
def nao_encontrado(error):
    return jsonify({
        "erro": "Endpoint não encontrado"
    }), 404


if __name__ == '__main__':
    # Inicializar gerenciador de tarefas
    TaskManager.inicializar()
    
    # Exibir configurações
    exibir_config()
    
    logger.info(f"Iniciando servidor Flask em http://{FLASK_HOST}:{FLASK_PORT}")
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
