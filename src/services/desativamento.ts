import { API_HOST } from "../utils/static";

export const desativarApontamento = async (id: number) => {
  const storedToken = localStorage.getItem("access");

  const response = await fetch(
    `http://${API_HOST}:8000/api/acesso/desativar-apontamento/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${storedToken}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Erro: ${response.status}`);
  }

  return response;
};