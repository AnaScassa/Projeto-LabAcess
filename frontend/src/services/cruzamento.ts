
import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export interface Cruzamento {
  id: number;
  matricula: string;
  usuario: string;
  data_acesso: string;
  porta: string;
  motivo: string;
}

export async function carregarCruzamentos(): Promise<Cruzamento[]> {
  const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/cruzamentos/`);

  if (!response.ok) {
    throw new Error("Erro ao carregar cruzamentos");
  }

  return response.json() as Promise<Cruzamento[]>;
}