import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export interface Acesso {
  id: number;
  usuario: string;
  data_acesso: string | null;
  desc_evento: string;
  desc_area: string;
  desc_leitor: string;
  ent_sai: string;
  eh_agendado: boolean;
  categoriaUsuario: string | null;
}

export async function carregarAcessos(): Promise<Acesso[]> {
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/acessos/`);

  if (!response.ok) {
    throw new Error(`Erro ao carregar acessos: HTTP ${response.status}`);
  }

  return response.json() as Promise<Acesso[]>;
}
