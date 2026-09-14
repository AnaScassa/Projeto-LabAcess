
import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export interface Cruzamento {
  id: number;
  matricula: string;
  usuario: string;
  data_acesso: string;
  porta: string;
  motivo: string;
}

export async function carregarCruzamentos(): Promise<Cruzamento[]> {
  const response = await authFetch(`http://${API_HOST}:8000/api/acesso/cruzamentos/`);

  if (!response.ok) {
    throw new Error("Erro ao carregar cruzamentos");
  }

  return response.json() as Promise<Cruzamento[]>;
}