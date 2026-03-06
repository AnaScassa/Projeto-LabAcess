import { useEffect, useState } from "react";

interface Acesso {
  id: number;
  data_acesso: string;
  desc_evento: string;
  desc_area: string;
  desc_leitor: string;
  ent_sai: string;
  usuario: string;
}

export default function Listagem() {
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("access");

    fetch("http://localhost:8000/api/acesso/lista-acessos/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao buscar acessos");
        }
        return res.json(); 
      })
      .then((data) => {
        setAcessos(data);
      })
      .catch((err) => {
        console.error("Erro:", err);
        setErro("Erro ao carregar dados.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Carregando acessos...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Listagem de Usuários</h1>

      <a href="/upload">
        <button style={{ marginBottom: "20px" }}>Voltar</button>
      </a>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data e Hora</th>
            <th>Evento</th>
            <th>Área</th>
            <th>Leitor</th>
            <th>Entrada/Saída</th>
            <th>Usuário</th> 
          </tr>
        </thead>
        <tbody>
          {acessos.length > 0 ? (
            acessos.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.data_acesso}</td>
                <td>{a.desc_evento}</td>
                <td>{a.desc_area}</td>
                <td>{a.desc_leitor}</td>
                <td>{a.ent_sai}</td>
                <td>{a.usuario}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Nenhum acesso encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}