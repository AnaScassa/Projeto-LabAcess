import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export type StatusRpa = {
  online: boolean;
  ultimo_sinal: string | null;
};

export async function buscarStatusRpa(): Promise<StatusRpa> {
  const response = await authFetch(`http://${API_HOST}:8000/api/acesso/status-rpa/`);

  if (!response.ok) {
    throw new Error(`Erro ao consultar o RPA: HTTP ${response.status}`);
  }

  return response.json() as Promise<StatusRpa>;
}
