import { authFetch } from "./auth";
import type { Treinamento } from "../types/Treinamento";
import { USERS_API_BASE } from "../utils/static";

export async function carregarTreinamento(): Promise<Treinamento[]> {

  const res = await authFetch(`${USERS_API_BASE}/api/users/safety-training/`);

  if (!res) return [];

  if (!res.ok) {
    throw new Error("Não autorizado");
  }

  return await res.json();
}