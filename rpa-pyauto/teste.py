import pyautogui
import logging
import time
import json
from datetime import datetime

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

console_handler = logging.StreamHandler()
console_handler.setFormatter(JsonFormatter())

logger.addHandler(console_handler)


def teste1():

    try:
        
        try:
            foto1 = pyautogui.locateCenterOnScreen('./img/foto1_vm.png', minSearchTime=10, confidence=0.8)
        except pyautogui.ImageNotFoundException:
            foto1 = None

        if foto1 is not None:
            pyautogui.click(foto1)
        else:
            pyautogui.press('win')

            time.sleep(2)

            try:
                foto1 = pyautogui.locateCenterOnScreen('./img/foto1_vm.png',minSearchTime=10, confidence=0.8)
            except pyautogui.ImageNotFoundException:
                foto1 = None

            if foto1 is not None:
                pyautogui.click(foto1)

            else:
                logger.info("Não foi possível achar a foto1")

    except pyautogui.ImageNotFoundException:
        logger.info("Não foi possível achar a foto1")

    time.sleep(2)
    try:
        
        try:
            foto2 = pyautogui.locateCenterOnScreen('./img/foto2.png', minSearchTime=10, confidence=0.8)
        except pyautogui.ImageNotFoundException:
            foto2 = None

        if foto2 is not None:
            pyautogui.click(foto2)
        else:
            try:
                pyautogui.press('win')
                logger.info("WINDOWS")
            except pyautogui.ImageNotFoundException:
                logger.info("Não foi possível achar a foto2")

            time.sleep(2)

            try:
                foto2 = pyautogui.locateCenterOnScreen('./img/foto2.png', minSearchTime=10, confidence=0.8)
            except pyautogui.ImageNotFoundException:
                foto2 = None

            if foto2 is not None:
                pyautogui.click(foto2)

            else:
                logger.info("Não foi possível achar a foto2")

    except pyautogui.ImageNotFoundException:
        logger.info("Não foi possível achar a foto2")