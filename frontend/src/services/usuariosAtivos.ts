import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";


export async function getUsuariosAtivos() {
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/usuarios-ativos/`, {
    method: "GET",
  });
              
  if (!response.ok) {
    throw new Error("Erro ao buscar usuários ativos");
  }

  return response.json();
}