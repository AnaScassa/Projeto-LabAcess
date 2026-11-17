import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export type StatusRpa = {
  online: boolean;
  ultimo_sinal: string | null;
};

export async function buscarStatusRpa(): Promise<StatusRpa> {
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/status-rpa/`);

  if (!response.ok) {
    throw new Error(`Erro ao consultar o RPA: HTTP ${response.status}`);
  }

  return response.json() as Promise<StatusRpa>;
}
