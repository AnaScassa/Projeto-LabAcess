import pyautogui
import time
import webbrowser

def entrar_site():
    webbrowser.open("http://localhost:3000/login")

def login():
    time.sleep(3)
    pyautogui.click(800, 570)
    pyautogui.write("anacha")

    pyautogui.click(800, 630)
    pyautogui.write("123")

    pyautogui.click(820, 680)
    time.sleep(3)


def upload():
    pyautogui.click(320, 590)
    time.sleep(2)
    pyautogui.write(r"C:\arquivo.xls")
    pyautogui.press("enter")