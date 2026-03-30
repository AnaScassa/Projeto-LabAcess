import { authFetch } from "./auth";
import type { Treinamento } from "../types/Treinamento";
import { API_HOST } from "../utils/static";

export async function carregarTreinamento(): Promise<Treinamento[]> {

  const res = await authFetch(`http://${API_HOST}:8000/api/users/safety-training/`);

  if (!res) return [];

  if (!res.ok) {
    throw new Error("Não autorizado");
  }

  return await res.json();
}