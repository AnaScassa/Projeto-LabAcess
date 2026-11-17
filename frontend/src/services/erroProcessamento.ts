import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export type ErroProcessamento = {
  id: number;
  status: string;
  user: string | null;
  task_name: string | null;
  atualizado_em: string;
};

export async function buscarErrosProcessamento(): Promise<ErroProcessamento[]> {
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/erro-processamento/`);

  if (!response.ok) {
    throw new Error(`Erro ao consultar os processamentos com erro: HTTP ${response.status}`);
  }

  return response.json() as Promise<ErroProcessamento[]>;
}
