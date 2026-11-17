import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export interface AgendamentoNaoUtilizado {
    matricula: string;
    usuario: string;
    quantidade: number;
}

export const buscarAgendamentosNaoUtilizados = async (): Promise<AgendamentoNaoUtilizado[]> => {
    const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/agendamentos-nao-utilizados/`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
    }

    return response.json();
};
