import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export interface AcessoAgendado {
    matricula: string;
    usuario: string;
    quantidade: number;
}

export const buscarAcessosAgendados = async (): Promise<AcessoAgendado[]> => {
    const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/acessos-agendados/`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
    }

    return response.json();
};
