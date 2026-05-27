import time
import pyautogui
from desktop import entrarSes, excluir_arquivo
from web import entrarSite

def main():
    entrarSes()
    #entrarSite()
    #excluir_arquivo()
    #testarPixel()


if __name__ == "__main__":
    main()
    
def testarPixel():
    try:
        while True:
            time.sleep(5)
            x, y = pyautogui.position()
            print(f"X: {x} Y: {y}", end="\r")
            time.sleep(15)

    except KeyboardInterrupt:
        print("\nFinalizado")