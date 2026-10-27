import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export type ErroRpa = {
  id: number;
  mensagem: string;
  data: string;
};

export async function buscarErrosRpa(): Promise<ErroRpa[]> {
  const response = await authFetch(`http://${API_HOST}:8000/api/acesso/erros-rpa/`);

  if (!response.ok) {
    throw new Error(`Erro ao consultar os erros do RPA: HTTP ${response.status}`);
  }

  return response.json() as Promise<ErroRpa[]>;
}
