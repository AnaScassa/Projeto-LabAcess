import { useEffect, useState } from "react";
import { carregarUsers } from "../services/users";
import type { Users } from "../types/Users";

export function useUsers() {
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await carregarUsers();
      setUsers(data);
      setLoading(false);
      console.log("usuarios carregados:", users);
    }

    load();
  }, []);

  return { users, loading };
}