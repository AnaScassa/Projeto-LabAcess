import { useEffect, useState } from "react";
import { carregarTreinamento } from "../services/treinamento";
import type { Treinamento } from "../types/Treinamento";

export function useTreinamento() {
  const [treinamentos, setTreinamento] = useState<Treinamento[]>([]);

  useEffect(() => {
    async function load() {
      const data = await carregarTreinamento();
      setTreinamento(data);
    }

    load();
  }, []);

  return { treinamentos };
}