import { fetchEventSource } from "@microsoft/fetch-event-source";
import { API_HOST } from "../utils/static";

export interface Processamento {
    id: number;
    task_id: string;
    status: string;
    criado_em: string;
    atualizado_em: string;
    user: string;
    task_id_parent: string | null;
    task_name: string | null;
}

export const verificarProcessamento = async (onAtualizacao: (processamentos: Processamento[]) => void) => {
    const token = localStorage.getItem("access");

    if (!token) {
        return;
    }

    await fetchEventSource(`http://${API_HOST}:8000/api/acesso/processamento/`, {
        method: "GET",

        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
        },

        onmessage(event) {
            const dados: Processamento[] = JSON.parse(event.data);

            onAtualizacao(dados);
        },

        onerror(error) {
            console.error("Erro no SSE:", error);
            throw error;
        },
    });
};