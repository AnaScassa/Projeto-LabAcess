import { fetchEventSource } from "@microsoft/fetch-event-source";
import { SMARTCARD_API_BASE } from "../utils/static";

interface EventoNotificacao {
  tipo?: string;
  id?: number;
}

interface OpcoesNotificacoesStream {
  aoConectar: () => void;
  aoReceberNotificacao: (id: number) => void;
  aoErro: (erro: unknown) => void;
}

export function escutarNotificacoesUsuario({
  aoConectar,
  aoReceberNotificacao,
  aoErro,
}: OpcoesNotificacoesStream): () => void {
  const token = localStorage.getItem("access");
  if (!token) return () => {};

  const controller = new AbortController();

  void fetchEventSource(`${SMARTCARD_API_BASE}/api/acesso/notificacoes/stream/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
    signal: controller.signal,
    async onopen(response) {
      if (!response.ok) {
        throw new Error(`Erro na conexão de notificações: HTTP ${response.status}`);
      }
      aoConectar();
    },
    onmessage(event) {
      if (!event.data) return;

      try {
        const evento: EventoNotificacao = JSON.parse(event.data);
        if (evento.tipo === "nova_notificacao" && typeof evento.id === "number") {
          aoReceberNotificacao(evento.id);
        }
      } catch (erro) {
        aoErro(erro);
      }
    },
    onerror(erro) {
      aoErro(erro);
    },
  }).catch((erro: unknown) => {
    if (!controller.signal.aborted) aoErro(erro);
  });

  return () => controller.abort();
}
