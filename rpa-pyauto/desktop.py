from datetime import datetime, timedelta
import time 
import pyautogui
import static
import logging
import json

# FORMATADOR JSON
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "time": datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S"),
            "level": record.levelname,
            "message": record.getMessage()
        }
        return json.dumps(log_record, ensure_ascii=False)


# CONFIG LOGGER
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# evita duplicação
if logger.hasHandlers():
    logger.handlers.clear()

# arquivo (JSONL)
file_handler = logging.FileHandler("rpa.jsonl", encoding="utf-8")
file_handler.setFormatter(JsonFormatter())

# terminal
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))

# adiciona handlers
logger.addHandler(file_handler)
logger.addHandler(console_handler)

def entrarSes():
    logger.info("RPA iniciado")
    
    try:
        pyautogui.press('win')
        pyautogui.write('SESClient')
        pyautogui.press('enter')
        time.sleep(3) 
        logger.info("SESClient aberto com sucesso")
    except Exception as e:
        logger.error(f"Erro ao abrir o SESClient: {e}")
    
    try:
        usuario = pyautogui.locateCenterOnScreen('img/usuarioSes.PNG', confidence=0.8)
        
        if usuario is not None:
            pyautogui.click(usuario) 
            time.sleep(3)     
            try:   
                pyautogui.write(static.USUARIO, interval=0.1)
            except Exception as e:
                logger.error(f"Erro ao entrar no SESClient: {e}")
                return
            pyautogui.press("tab")
            pyautogui.write(static.SENHA, interval=0.1)
            
            pyautogui.press("tab")
            pyautogui.press("tab")
            pyautogui.press("tab")
            
            pyautogui.press("enter")
            logger.info("Login realizado com sucesso")
            pegar_arquivo()
        else:
            logger.error("Não encontrou campo de usuário na tela")
            
    except Exception as e:
        logger.error(f"Erro inesperado no login: {e.__traceback__}")

def pegar_arquivo():
    hora_calculada = datetime.now() - timedelta(minutes=5)
    hora_formatada = hora_calculada.strftime("%H%M")
    hora_atual_formatada = datetime.now().strftime("%H%M")
    
    n = [60, 123, 90]
    a = ["funcionarios_", "alunos_", "prestadores_"]
    
    for i in range(3):
        try:
            time.sleep(2) 
            pyautogui.click(536, 30)
            time.sleep(2) 
            pyautogui.click(536, n[i])
            
            time.sleep(2)
            pyautogui.click(527, 905)
            time.sleep(2)
            pyautogui.write(hora_formatada)
            pyautogui.press("tab")
            pyautogui.write(hora_atual_formatada)
            
            time.sleep(5)
            consultar = pyautogui.locateCenterOnScreen('img/consultarMarcacao.PNG', confidence=0.8)
            
            if consultar:
                pyautogui.click(consultar)
                logger.info(f"Consulta realizada: {a[i]}")
            else:
                logger.error("Botão consultar não encontrado")
                continue
            
            time.sleep(2)
            exportar = pyautogui.locateCenterOnScreen('img/exportar.PNG', confidence=0.8)
            
            if exportar:
                try:
                    pyautogui.click(exportar)
                except Exception:
                    pyautogui.press("enter")
                    logger.warning("Sem dados para exportar")
                    continue
            else:
                logger.error("Botão exportar não encontrado")
                continue
            
            time.sleep(3)
            nome_arquivo = a[i] + hora_atual_formatada + ".xls"
            
            pyautogui.write(nome_arquivo)
            pyautogui.press("tab")
            pyautogui.press("enter")
            pyautogui.press("enter")
            
            logger.info(f"Arquivo salvo: {nome_arquivo}")
        
        except Exception as e:
            logger.error(f"Erro no loop {a[i]}: {e}")