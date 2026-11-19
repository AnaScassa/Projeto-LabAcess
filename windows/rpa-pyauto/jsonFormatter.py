
import logging
import json
import sys
import tempfile
from datetime import datetime
from pathlib import Path


class SafeStreamHandler(logging.StreamHandler):

    def emit(self, record):
        try:
            if self.stream is not None and not self.stream.closed:
                super().emit(record)
        except (OSError, ValueError):
            pass


class RpaErrorRabbitHandler(logging.Handler):
    def emit(self, record):
        try:
            from publisher import enviar_mensagem

            enviar_mensagem({"mensagem": record.getMessage()}, "rpa_erros")
        except Exception:
            self.handleError(record)


class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {"time": datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S"),
            "level": record.levelname,
            "message": record.getMessage()
        }

        return json.dumps(log_record, ensure_ascii=False)


logger = logging.getLogger()
logger.setLevel(logging.INFO)

if logger.hasHandlers():
    logger.handlers.clear()

console_handler = SafeStreamHandler(sys.stderr)
console_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
logger.addHandler(console_handler)

caminhos_log = (Path(__file__).resolve().with_name("Logs") / "rpa.jsonl", Path(tempfile.gettempdir()) / "rpa-pyauto" / "rpa.jsonl")

file_handler = None

for caminho_log in caminhos_log:
    try:
        caminho_log.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(caminho_log, encoding="utf-8")

        file_handler.setFormatter(JsonFormatter())
        logger.addHandler(file_handler)
        break

    except (OSError, ValueError) as erro:
        logger.warning("Não foi possível criar o log em %s: %s", caminho_log, erro)

if file_handler is None:
    logger.warning("Os logs serão gravados apenas no console.")

error_handler = RpaErrorRabbitHandler(level=logging.ERROR)
logger.addHandler(error_handler)

logging.getLogger("pika").setLevel(logging.CRITICAL)
