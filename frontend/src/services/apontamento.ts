import { authFetch } from "./auth";
import type { Apontamento  } from "../types/Apontamento";
import { SMARTCARD_API_BASE } from "../utils/static";

export async function carregarApontamento(): Promise<Apontamento[]>{
    const res = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/apontamento/`);
    
    if (!res) return [];
    if (!res.ok) {
        throw new Error("Não autorizado");
    }

    return await res.json();
}

export const desativarApontamento = async (id: number) => {
    const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/desativar-apontamento/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
    }

    return response;
};