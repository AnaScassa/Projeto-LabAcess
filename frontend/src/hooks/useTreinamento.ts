import { useEffect, useState } from "react";
import { carregarTreinamento } from "../services/treinamento";
import type { Treinamento } from "../types/Treinamento";

export function useTreinamento() {
  const [treinamentos, setTreinamento] = useState<Treinamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await carregarTreinamento();
        setTreinamento(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { treinamentos, loading };
}