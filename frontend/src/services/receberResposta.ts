import { fetchEventSource } from "@microsoft/fetch-event-source";
import { API_HOST } from "../utils/static";

export function receberRespostas(onMensagem: (dados: any) => void, onErro: () => void) {
    const token = localStorage.getItem("access");

    if (!token) {
      return () => {};
    }

    const controller = new AbortController();

    fetchEventSource(`http://${API_HOST}:8000/api/acesso/receber-resposta/`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },

        signal: controller.signal,

        onmessage(event) {
                    
          try {
            const dados = JSON.parse(event.data);

            onMensagem(dados);
          } catch (erro) {
            console.error("Erro ao converter mensagem SSE:", erro);
          }
        },

        onerror(error) {
          console.error("Erro no SSE:", error);

          onErro();

        },
      }
    );

    return () => {
      controller.abort();
    };
}