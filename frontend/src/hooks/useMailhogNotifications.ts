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

          const email = JSON.parse(event.data);
          const assunto = email.Content?.Headers?.Subject?.[0] ?? "Novo e-mail";
          const mensagem = email.Content?.Body?.substring(0, 120) ?? "";

          exibirNotificacao(assunto, mensagem);
        },

        onerror(error) {
          console.error("Erro na conexão SSE:", error);
          throw error;
        },
      }
    );

    return () => {
      controller.abort();
    };

  }, []);
}