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
        time.sleep(5)
    except Exception as e:
        logger.error(f"Erro ao abrir o SESClient: {e}")
    
    try:
        try:
            usuario = pyautogui.locateCenterOnScreen('./img/usuarioSes.PNG', confidence=0.5)
        except pyautogui.ImageNotFoundException:
            usuario = None
            logger.error("Imagem não encontrada")
        except Exception as erro:
            usuario = None
            logger.error(erro)

        time.sleep(1)

        if usuario is None:
            logger.warning("Campo de usuário não encontrado na tela")
            time.sleep(2)
            pyautogui.click(500, 300)
            time.sleep(1)
            pyautogui.press('enter')
            time.sleep(2)

        else:
            pyautogui.click(usuario)
            time.sleep(1)

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

    except Exception:
        logger.error(traceback.format_exc())

def pegar_arquivo():
    hora_calculada = datetime.now() - timedelta(minutes=10)
    hora_formatada = hora_calculada.strftime("%H%M")
    hora_atual_formatada = datetime.now().strftime("%H%M")
    
    n = [60, 110, 80]
    
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

            try:
                consultar = pyautogui.locateCenterOnScreen('./img/consultarMarcacao.PNG',confidence=0.8)
            except pyautogui.ImageNotFoundException:
                consultar = None
                logger.error("Imagem não encontrada")
            except Exception as erro:
                consultar = None
                logger.error(erro)

            if consultar is None:
                logger.error("Botão consultar não encontrado na tela")
                continue
            
            pyautogui.click(consultar)
            logger.info(f"Consulta realizada: {[i + 1]}")
            time.sleep(5) 
             
            try:
                icone_erro = pyautogui.locateCenterOnScreen('./img/iconeErro.PNG', minSearchTime=5 ,confidence=0.7)
            except pyautogui.ImageNotFoundException:
                icone_erro = None
            except Exception as erro:
                icone_erro = None
                logger.error(erro)
                
            if icone_erro is not None:
                pyautogui.click(icone_erro)
                time.sleep(1)
                pyautogui.press('enter')
                logger.info("Nenhum dado foi retornado")
                continue
            
            time.sleep(5)
            
            pyautogui.click(1174, 630)
            time.sleep(2)

            pyautogui.click(1240, 630)
            time.sleep(3)
            
            try:
                icone_erro = pyautogui.locateCenterOnScreen('./img/iconeErro.PNG', minSearchTime=5 ,confidence=0.7)
            except pyautogui.ImageNotFoundException:
                icone_erro = None
            except Exception as erro:
                icone_erro = None
                logger.error(erro)

            if icone_erro is not None:
                pyautogui.click(icone_erro)
                time.sleep(1)
                pyautogui.press('enter')
                logger.info(f"Arquivo salvo")
                continue
            
        except Exception as e:
            logger.error(f"Erro no loop {[i]}: {e}")
    
    for i in range(3):
        time.sleep(2)
        try:
            sair = pyautogui.locateCenterOnScreen('./img/sair.png', confidence=0.8)
        except pyautogui.ImageNotFoundException:
            sair = None
        except Exception as erro:
            sair = None
            logger.error(erro)
            
        if sair is not None:
            pyautogui.click(sair)
            
            
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