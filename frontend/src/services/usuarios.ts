import type { Usuario } from "../types/Usuario";
import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export async function carregarUsuariosSmartcard(): Promise<Usuario[]> {
  const response = await authFetch(`http://${API_HOST}:8000/api/acesso/usuarios/`);

  if (!response.ok) {
    throw new Error(`Erro ao carregar usuários do SmartCard: HTTP ${response.status}`);
  }

  return response.json() as Promise<Usuario[]>;
}

export type AtualizacaoUsuario = {
  matricula: string;
  nome_usuario: string;
  categoriaUsuario: string | null;
  user_auth_id: number | null;
  username_mrbs: string | null;
};

export async function atualizarUsuarioSmartcard(
  id: number,
  dados: AtualizacaoUsuario,
): Promise<Usuario> {
  const response = await authFetch(`http://${API_HOST}:8000/api/acesso/usuarios/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(`Erro ao atualizar usuário do SmartCard: HTTP ${response.status}`);
  }

  return response.json() as Promise<Usuario>;
}

export async function carregarUsuarios(): Promise<Usuario[]> {
  try {
    return await carregarUsuariosSmartcard();
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    return [];
  }
}
