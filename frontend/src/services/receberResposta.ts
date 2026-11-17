import { fetchEventSource } from "@microsoft/fetch-event-source";
import { SMARTCARD_API_BASE } from "../utils/static";

export type RespostaRpa = {
  status?: string;
  quantidade?: number;
  criado_em?: string | null;
};

export function receberRespostas(onMensagem: (dados: RespostaRpa) => void, onErro: () => void) {
    const token = localStorage.getItem("access");

    if (!token) {
      return () => {};
    }

    const controller = new AbortController();

    fetchEventSource(`${SMARTCARD_API_BASE}/api/acesso/receber-resposta/`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },

        signal: controller.signal,
        openWhenHidden: true,

        onmessage(event) {
                    
          try {
            const dados = JSON.parse(event.data) as RespostaRpa;

            onMensagem(dados);
          } catch (erro) {
            console.error("Erro ao converter mensagem SSE:", erro);
          }
        },

        onerror(error) {
          if (!document.hidden) {
            console.error("Erro no SSE:", error);
          }

          onErro();

        },
      }
    );

    return () => {
      controller.abort();
    };
}