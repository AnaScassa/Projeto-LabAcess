import { API_HOST } from "../utils/static";
import { authFetch } from "./auth";

export const limparResposta = async () => {
  try {
    const response = await authFetch(`http://${API_HOST}:8000/api/acesso/limpar-resposta/`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Erro ao limpar resposta");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao limpar resposta:", error);
    throw error;
  }
};