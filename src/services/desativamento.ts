import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export const desativarApontamento = async (id: number) => {
  const response = await authFetch(
    `http://${API_HOST}:8000/api/acesso/desativar-apontamento/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Erro: ${response.status}`);
  }

  return response;
};