import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export type ErroRpa = {
  id: number;
  mensagem: string;
  data: string;
};

export async function buscarErrosRpa(): Promise<ErroRpa[]> {
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/erros-rpa/`);

  if (!response.ok) {
    throw new Error(`Erro ao consultar os erros do RPA: HTTP ${response.status}`);
  }

  return response.json() as Promise<ErroRpa[]>;
}
