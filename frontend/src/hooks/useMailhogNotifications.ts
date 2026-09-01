import { useEffect } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { exibirNotificacao } from "../utils/notificacoes";
import { API_HOST } from "../utils/static";

export function useMailhogNotifications() {
  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      return;
    }

    const controller = new AbortController();

    fetchEventSource(`http://${API_HOST}:8000/api/acesso/emails`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      signal: controller.signal,
      onmessage(event) {
        if (!event.data) {
          return;
        }

        try {
          const payload = JSON.parse(event.data);
          const assunto = payload.assunto ?? payload.subject ?? "Novo aviso";
          const mensagem = payload.mensagem ?? payload.message ?? "";

          if (assunto && mensagem) {
            exibirNotificacao(assunto, mensagem);
          }
        } catch (error) {
          console.error("Erro ao interpretar mensagem SSE:", error, event.data);
        }
      },
      onerror(error) {
        console.error("Erro na conexão SSE:", error);
        throw error;
      },
    });

    return () => {
      controller.abort();
    };
  }, []);
}