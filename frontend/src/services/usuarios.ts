import type { Usuario } from "../types/Usuario";
import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export async function carregarUsuariosSmartcard(incluirDesativados = false): Promise<Usuario[]> {
  const query = incluirDesativados ? "?incluir_desativados=true" : "";
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/usuarios/${query}`);

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
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/usuarios/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(`Erro ao atualizar usuário do SmartCard: HTTP ${response.status}`);
  }

  return response.json() as Promise<Usuario>;
}

export async function alterarStatusUsuarioSmartcard(
  matricula: string,
  estaAtivo: boolean,
): Promise<boolean> {
  const response = await authFetch(
    `${SMARTCARD_API_BASE}/api/acesso/alterar-status-usuario/${encodeURIComponent(matricula)}/`,
    {
      method: "POST",
      body: JSON.stringify({ esta_ativo: estaAtivo }),
    },
  );

  if (!response.ok) {
    throw new Error(`Erro ao alterar status do usuário: HTTP ${response.status}`);
  }

  const resultado: unknown = await response.json();
  if (
    typeof resultado !== "object"
    || resultado === null
    || !("esta_ativo" in resultado)
    || typeof resultado.esta_ativo !== "boolean"
  ) {
    throw new Error("Resposta inválida ao alterar status do usuário.");
  }

  return resultado.esta_ativo;
}

export async function carregarUsuarios(): Promise<Usuario[]> {
  try {
    return await carregarUsuariosSmartcard();
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    return [];
  }
}
