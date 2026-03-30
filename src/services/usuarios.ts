import { authFetch } from "./auth";
import type { Usuario } from "../types/Usuario";
import { API_HOST } from "../utils/static";

export async function carregarUsuarios(): Promise<Usuario[]> {
  try {
    const res = await authFetch(`http://${API_HOST}:8000/api/acesso/usuarios/`);

    if (!res) return [];

    if (!res.ok) {
      throw new Error("Não autorizado");
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    return [];
  }
}