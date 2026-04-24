import pyautogui

def clicar_imagem(img):
    pos = pyautogui.locateOnScreen(img)
    if pos:
        pyautogui.click(pos)