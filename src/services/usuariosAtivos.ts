import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";


export async function getUsuariosAtivos() {
  const response = await authFetch(`http://${API_HOST}:8000/api/acesso/usuarios-ativos`, {
    method: "GET",
  });
              
  if (!response.ok) {
    throw new Error("Erro ao buscar usuários ativos");
  }

  return response.json();
}