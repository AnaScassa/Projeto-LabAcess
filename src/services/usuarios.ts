import type { Usuario } from "../types/Usuario";
import { API_HOST } from "../utils/static";

export async function carregarUsuarios(): Promise<Usuario[]> {

  try {

    const token = localStorage.getItem("access");

    if (!token) {
      console.error("Token não encontrado");
      return [];
    }

    const res = await fetch(
      `http://${API_HOST}:8000/api/acesso/usuarios/`,
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 401) {
      console.error("Não autorizado");
      return [];
    }

    if (!res.ok) {
      throw new Error("Erro ao carregar usuários");
    }

    const data = await res.json();
    return data;

  } catch (error) {

    console.error("Erro ao carregar usuários:", error);

    return [];
  }
}