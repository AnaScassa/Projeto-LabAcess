import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export interface AcessoAgendado {
    matricula: string;
    usuario: string;
    quantidade: number;
}

export const buscarAcessosAgendados = async (): Promise<AcessoAgendado[]> => {
    const response = await authFetch(`http://${API_HOST}:8000/api/acesso/acessos-agendados/`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
    }

    return response.json();
};
