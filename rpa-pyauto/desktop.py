from datetime import datetime, timedelta
import os
import time
import traceback 
import pyautogui
import static
import logging
import json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "time": datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S"),
            "level": record.levelname,
            "message": record.getMessage()
        }
        return json.dumps(log_record, ensure_ascii=False)


logger = logging.getLogger()
logger.setLevel(logging.INFO)

if logger.hasHandlers():
    logger.handlers.clear()

file_handler = logging.FileHandler("rpa.jsonl", encoding="utf-8")
file_handler.setFormatter(JsonFormatter())

console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))

logger.addHandler(file_handler)
logger.addHandler(console_handler)

def entrarSes():
    logger.info("RPA iniciado")
    time.sleep(5)
    
    try:
        pyautogui.press('win')
        pyautogui.write('SESClient')
        pyautogui.press('enter')
        time.sleep(5) 
        logger.info("SESClient aberto com sucesso")
    except Exception as e:
        logger.error(f"Erro ao abrir o SESClient: {e}")
        
    erroIniciar = pyautogui.locateCenterOnScreen('./img/erroIniciar.PNG', confidence=0.8, grayscale=True)
    
    if erroIniciar:
        try:
            time.sleep(1)
            pyautogui.press("enter")
        except Exception as e:
            logger.error("Erro ao iniciar o SESClient: " + str(erroIniciar))
            return
    
    try:
        usuario = pyautogui.locateCenterOnScreen('./img/usuarioSes.PNG', confidence=0.8)
        time.sleep(1)
        
        if usuario is None:
            time.sleep(2)
            pyautogui.click(500, 300)
            logger.error("Campo de usuário não encontrado na tela")
            pyautogui.typewrite(str(static.USUARIO), interval=0.05)
            pyautogui.press("tab")
            pyautogui.write(static.SENHA, interval=0.1)
        else:
            pyautogui.click(usuario) 
            pyautogui.typewrite(str(static.USUARIO), interval=0.05)
            pyautogui.press("tab")
            pyautogui.write(static.SENHA, interval=0.1)
                
        pyautogui.press("tab")
        pyautogui.press("tab")
        pyautogui.press("tab")
                
        pyautogui.press("enter")
        logger.info("Login realizado com sucesso")
        pegar_arquivo()

    except Exception:
        logger.error(traceback.format_exc())

def pegar_arquivo():
    hora_calculada = datetime.now() - timedelta(minutes=30)
    hora_formatada = hora_calculada.strftime("%H%M")
    hora_atual_formatada = datetime.now().strftime("%H%M")
    
    n = [60, 110, 80]
    a = ["funcionarios", "alunos", "prestadores"]
    
    for i in range(3):
        try:            
            time.sleep(3)
            pyautogui.click(522, 41)
            time.sleep(2)

            pyautogui.click(522, n[i])
            time.sleep(3)

            pyautogui.click(525, 535)
            time.sleep(2)

            pyautogui.write(hora_formatada)
            time.sleep(1)

            pyautogui.press("tab")
            time.sleep(1)

            pyautogui.write(hora_atual_formatada)
            time.sleep(2)

            consultar = pyautogui.locateCenterOnScreen('./img/consultarMarcacao.PNG',confidence=0.6,grayscale=True)

            if consultar is None:
                logger.error("Botão consultar não encontrado na tela")
                continue

            pyautogui.click(consultar)
            logger.info(f"Consulta realizada: {a[i]}")

            time.sleep(8)  

            exportar = pyautogui.locateCenterOnScreen('./img/exportar.PNG',confidence=0.6,grayscale=True)

            if exportar:
                try:
                    pyautogui.click(exportar)
                    time.sleep(5)  
                    
                except Exception:
                    pyautogui.press("enter")
                    logger.warning("Sem dados para exportar")
                    continue
            else:
                pyautogui.press("enter")
                logger.error("Botão exportar não encontrado")
                continue

            time.sleep(3)

            pyautogui.click(608, 364)
            time.sleep(0.5)

            pyautogui.doubleClick(608, 364)
            time.sleep(0.5)

            pyautogui.hotkey("ctrl", "a")
            time.sleep(0.2)

            pyautogui.press("backspace")
            nome_arquivo = a[i] + ".xls"

            pyautogui.write(nome_arquivo)
            time.sleep(1)

            pyautogui.press("tab")
            pyautogui.press("tab")
            time.sleep(1)

            pyautogui.press("enter")
            time.sleep(3)

            pyautogui.press("enter")
            time.sleep(3)  

            logger.info(f"Arquivo salvo: {nome_arquivo}")
            
        except Exception as e:
            logger.error(f"Erro no loop {a[i]}: {e}")
            
def excluir_arquivo():
    try:
        arquivos = ["funcionarios", "alunos", "prestadores"]
        
        for nome in arquivos:
            caminho = f"C:\\Users\\anacha\\Documents\\arquivos\\{nome}.xls"
            try:
                os.remove(caminho)
                logger.info(f"Arquivo excluído: {caminho}")
            except FileNotFoundError:
                logger.warning(f"Arquivo não encontrado para exclusão: {caminho}")
            except Exception as e:
                logger.error(f"Erro ao excluir arquivo {caminho}: {e}")
    except Exception as e:
        logger.error(f"Erro inesperado na exclusão de arquivos: {e}")