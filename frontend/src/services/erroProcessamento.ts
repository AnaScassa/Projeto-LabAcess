import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export type ErroProcessamento = {
  id: number;
  status: string;
  user: string | null;
  task_name: string | null;
  atualizado_em: string;
};

export async function buscarErrosProcessamento(): Promise<ErroProcessamento[]> {
  const response = await authFetch(`http://${API_HOST}:8000/api/acesso/erro-processamento/`);

  if (!response.ok) {
    throw new Error(`Erro ao consultar os processamentos com erro: HTTP ${response.status}`);
  }

  return response.json() as Promise<ErroProcessamento[]>;
}
