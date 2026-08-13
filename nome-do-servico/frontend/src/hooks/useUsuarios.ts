import { useEffect, useState } from "react";
import { carregarUsuarios } from "../services/usuarios";
import type { Usuario } from "../types/Usuario";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await carregarUsuarios();
      setUsuarios(data);
      setLoading(false);
    }

    load();
  }, []);

  return { usuarios, loading };
}