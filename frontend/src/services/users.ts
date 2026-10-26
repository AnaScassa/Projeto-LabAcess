import { authFetch } from "./auth";
import type { Users } from "../types/Users";
import { API_HOST } from "../utils/static";

export async function buscarUsers(): Promise<Users[]> {
    const res = await authFetch(`http://${API_HOST}:8000/api/users/user/`);

    if (!res.ok) {
        throw new Error("Erro ao buscar usuários do users_service");
    }

    return res.json();
}

export async function carregarUsers(): Promise<Users[]> {
    try {
        return await buscarUsers();
    } catch (error) {
        console.error("Erro ao carregar users:", error);
        return [];
    }
}