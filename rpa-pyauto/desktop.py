import time 
import pyautogui
import static

from datetime import datetime, timedelta

def entrarSes():
    pyautogui.press('win')
    pyautogui.write('SESClient')
    pyautogui.press('enter')
    
    time.sleep(3) 
    
    try:
        usuario = pyautogui.locateCenterOnScreen('img/usuarioSes.PNG', confidence=0.8)
        
        if usuario is not None:
            pyautogui.click(usuario) 
            time.sleep(0.5)        
            pyautogui.write(static.USUARIO, interval=0.1)
            pyautogui.press("tab")
            pyautogui.write(static.SENHA, interval=0.1)
            
            pyautogui.press("tab")
            pyautogui.press("tab")
            pyautogui.press("tab")
            
            pyautogui.press("enter")
            pegar_arquivo()
        else:
            print("Erro: Não consegui encontrar a imagem na tela.")
            
    except Exception as e:
        print(f"Erro inesperado: {e}")
        
        
def pegar_arquivo():
    #calcular hora
    hora_calculada = datetime.now() - timedelta(minutes=200)
    hora_formatada = hora_calculada.strftime("%H%M")
    hora_atual_formatada = datetime.now().strftime("%H%M")
    
    n = [60, 123, 90]
    a = ["funcionarios_", "alunos_", "prestadores_"]
    
    for i in range(3):
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
        consultarMarcacao = pyautogui.locateCenterOnScreen('img/consultarMarcacao.PNG', confidence=0.8)
        if consultarMarcacao is not None:
            pyautogui.click(consultarMarcacao)
        else:
            print("Erro: Não consegui encontrar a imagem 'consultarMarcacao' na tela.")
        
        time.sleep(2)
        exportar = pyautogui.locateCenterOnScreen('img/exportar.PNG', confidence=0.8)
        if exportar is not None:
            try:
                pyautogui.click(exportar)
            except:
                pyautogui.press("enter")
        else:
            print("Erro: Não consegui encontrar a imagem 'exportar' na tela.")
            
        time.sleep(3)
        pyautogui.write(a[i] + hora_atual_formatada + ".xls")
        pyautogui.press("tab")
        pyautogui.press("enter")
        pyautogui.press("enter")