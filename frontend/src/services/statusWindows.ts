import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export type StatusWindows = {
  agent_id: string;
  name: string;
  status: string;
  os: string | null;
  last_keepalive: string | null;
};

export async function buscarStatusWindows(): Promise<StatusWindows> {
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/status-windows/`);

  if (!response.ok) {
    throw new Error(`Erro ao consultar o Windows: HTTP ${response.status}`);
  }

  return response.json() as Promise<StatusWindows>;
}

export async function reiniciarWindows(): Promise<void> {
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/reiniciar-windows/`, {
    method: "POST",
  });

  if (!response.ok) {
    const detalhe = (await response.text()).trim().slice(0, 300);
    throw new Error(`Erro ao solicitar reinício do Windows: HTTP ${response.status}${detalhe ? ` - ${detalhe}` : ""}`);
  }
}
