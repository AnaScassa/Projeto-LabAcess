import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export const buscarRegistro = async () => {
  const response = await authFetch(
    `http://${API_HOST}:8000/api/acesso/buscar-registro/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro: ${response.status}`);
  }

  return response.json();
};