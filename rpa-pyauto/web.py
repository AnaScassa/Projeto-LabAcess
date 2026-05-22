from venv import logger

import pyautogui
import time
import webbrowser
import traceback


def entrarSite():
    webbrowser.open("http://localhost:3000/login")
    login()

def login():
    try:
        time.sleep(3)

        pyautogui.click(800, 570)
        pyautogui.write("anacha")

        pyautogui.click(800, 630)
        pyautogui.write("123")

        pyautogui.click(820, 680)

        time.sleep(3)

        logger.info("Login realizado com sucesso")

        upload()

    except Exception:
        logger.error(traceback.format_exc())


def upload():
    try:
        enviar = pyautogui.locateCenterOnScreen('img/enviar.PNG', confidence=0.8)

        if enviar is None:
            logger.error("Botão enviar não encontrado")
            return

        arquivos = ["funcionarios", "alunos", "prestadores"]

        for nome in arquivos:

            try:
                arquivo = pyautogui.locateCenterOnScreen('img/arquivo.PNG', confidence=0.8)

            except pyautogui.ImageNotFoundException:
                logger.error("Campo de arquivo não encontrado")
                continue

            caminho = (f"C:\\Users\\anacha\\Documents\\arquivos\\{nome}.xls")

            pyautogui.click(arquivo)
            time.sleep(1)

            pyautogui.hotkey("ctrl", "a")
            pyautogui.press("backspace")

            pyautogui.write(caminho)

            time.sleep(2)
            pyautogui.press("enter")
            time.sleep(3)

            try:
                erro = pyautogui.locateCenterOnScreen('img/erro.PNG', confidence=0.8)

                if erro is not None:
                    logger.error(f"Erro ao carregar arquivo: {nome}.xls")
                    pyautogui.press("enter")
                    time.sleep(1)
                    pyautogui.press("esc")
                    time.sleep(1)
                    continue

            except pyautogui.ImageNotFoundException:
                logger.info(f"Arquivo carregado com sucesso: {nome}.xls")

            try:
                time.sleep(1)
                pyautogui.click(enviar)
                time.sleep(5)

            except Exception:
                logger.error(traceback.format_exc())

    except Exception:
        logger.error(traceback.format_exc())