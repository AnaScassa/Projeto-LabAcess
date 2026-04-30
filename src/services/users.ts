import { authFetch } from "./auth";
import type { Users } from "../types/Users";
import { API_HOST } from "../utils/static";

export async function carregarUsers(): Promise<Users[]> {
    try {
        const res = await authFetch(`http://${API_HOST}:8001/api/users/user/`);

        if (!res) return [];

        if (!res.ok) {
        throw new Error("Não autorizado");
        }

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Erro ao carregar users:", error);
        return [];
    }
}