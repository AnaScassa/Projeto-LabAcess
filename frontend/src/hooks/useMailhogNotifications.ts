import { useEffect, useRef } from "react";
import { exibirNotificacao } from "../utils/notificacoes";
import { API_HOST } from "../utils/static";

export function useMailhogNotifications() {
  const idsVistos = useRef(new Set<string>());

  useEffect(() => {
    const verificar = async () => {
      const token = localStorage.getItem("access");
      const res = await fetch(`http://${API_HOST}:8000/api/acesso/emails`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      const emails = data.items || [];

      emails.forEach((email: any) => {
        if (!idsVistos.current.has(email.ID)) {
          idsVistos.current.add(email.ID);

          const assunto =
            email.Content?.Headers?.Subject?.[0] ?? "Novo e-mail";

          const mensagem =
            email.Content?.Body?.substring(0, 120) ?? "";

          exibirNotificacao(assunto, mensagem);
        }
      });
    };

    verificar();
    const interval = setInterval(verificar, 3000);

    return () => clearInterval(interval);
  }, []);
}