import { API_HOST } from "../utils/static";
import { authFetch } from "./auth";

export const buscarResposta = async () => {
  try {
    const response = await authFetch(`http://${API_HOST}:8000/api/acesso/receber-resposta/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao buscar resposta");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar resposta:", error);
    throw error;
  }
};