import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export interface AgendamentoNaoUtilizado {
    matricula: string;
    usuario: string;
    quantidade: number;
}

export const buscarAgendamentosNaoUtilizados = async (): Promise<AgendamentoNaoUtilizado[]> => {
    const response = await authFetch(`http://${API_HOST}:8000/api/acesso/agendamentos-nao-utilizados/`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
    }

    return response.json();
};
