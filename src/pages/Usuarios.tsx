import { useEffect, useState } from "react";

interface Acesso {
  0: string;
  1: string;
  2: string;
}

interface Usuario {
  id: number;
  matricula: string;
  nome_usuario: string;
  acessos?: Acesso[];
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mensagem, setMensagem] = useState<string>("");

  useEffect(() => {
    const storedToken = localStorage.getItem("access");

    if (!storedToken) {
      window.location.replace("/login");
      return;
    }

    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchUsuarios = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/acesso/usuarios/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar usuários");
        }

        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        setMensagem("Erro ao carregar usuários.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [token]);

  if (loading) {
    return <p>Carregando usuários...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Listagem de Usuários</h1>

      <a href="/upload">
        <button style={{ marginBottom: "20px" }}>Voltar</button>
      </a>

      {mensagem && <p style={{ color: "red" }}>{mensagem}</p>}

      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Matrícula</th>
            <th>Nome</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.matricula}</td>
              <td>{u.nome_usuario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}