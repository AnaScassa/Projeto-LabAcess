import { authFetch } from "./auth";
import type { Apontamento  } from "../types/Apontamento";

export async function carregarApontamento(): Promise<Apontamento[]>{

    const res = await authFetch("http://localhost:8000/api/acesso/apontamento/");
    
    if (!res) return [];

    if (!res.ok) {
        throw new Error("Não autorizado");
    }

    return await res.json();
}