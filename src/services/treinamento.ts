import { authFetch } from "./auth";
import type { Treinamento } from "../types/Treinamento";

export async function carregarTreinamento(): Promise<Treinamento[]> {

  const res = await authFetch("http://localhost:8000/api/users/safety-training/");

  if (!res) return [];

  if (!res.ok) {
    throw new Error("Não autorizado");
  }

  return await res.json();
}