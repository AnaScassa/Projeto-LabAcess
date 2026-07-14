from datetime import datetime, timedelta
import os
import time
import traceback 
import pyautogui
import static
from jsonFormatter import logger

def resolver_dados_busca(dados_busca=None):
    if dados_busca is not None:
        return {
            "data1": dados_busca["data_inicio"],
            "hora_inicio": dados_busca["hora_inicio"],
            "data2": dados_busca["data_fim"],
            "hora_fim": dados_busca["hora_fim"],
        }

    agora = datetime.now()
    hora_calculada = agora - timedelta(minutes=10)

    return {
        "data1": agora.strftime("%d%m%Y"),
        "hora_inicio": hora_calculada.strftime("%H%M"),
        "data2": agora.strftime("%d%m%Y"),
        "hora_fim": agora.strftime("%H%M"),
    }

def entrarSes(dados_busca=None):
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

        pegar_arquivo(dados_busca)

    except Exception:
        logger.error(traceback.format_exc())

    except Exception:
        logger.error(traceback.format_exc())

def pegar_arquivo(dados_busca=None):
    dados = resolver_dados_busca(dados_busca)

    if dados_busca is None:
        logger.info("Nenhuma busca manual. Executando busca automática.")
    else:
        logger.info(f"Busca manual recebida: {dados_busca}")

    data1 = dados["data1"]
    hora_inicio = dados["hora_inicio"]
    data2 = dados["data2"]
    hora_fim = dados["hora_fim"]

    n = [60, 110, 80]
    
    for i in range(3):
        try:            
            time.sleep(3)
            pyautogui.click(522, 41)
            time.sleep(2)

            pyautogui.click(522, n[i])
            time.sleep(3)

            pyautogui.click(358, 537)
            time.sleep(2)
            
            pyautogui.write(data1)
            time.sleep(1)
            
            pyautogui.press("tab")
            time.sleep(1)
            
            pyautogui.write(data2)
            time.sleep(1)

            pyautogui.press("tab")
            time.sleep(1)

            pyautogui.write(hora_inicio)
            time.sleep(1)

            pyautogui.press("tab")
            time.sleep(1)

            pyautogui.write(hora_fim)
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
    
    pyautogui.hotkey('alt', 'f4')
    logger.info("RPA finalizado")
    
def excluir_csvs():
    pasta = r"C:\Sualtech\SESClient"

    try:
        csvs = [
            os.path.join(pasta, arquivo)
            for arquivo in os.listdir(pasta)
            if arquivo.lower().endswith(".csv")
        ]

        for arquivo in csvs:
            os.remove(arquivo)
            logger.info(f"Arquivo excluído: {arquivo}")

    except Exception as e:
        logger.error(f"Erro ao excluir CSVs: {e}")
            
    