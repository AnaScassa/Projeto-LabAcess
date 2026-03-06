import { useEffect, useState } from "react";
import CalculadorTempo from "../components/CalculadorTempo";
import FiltroPortasCheckbox from "../components/FiltroPortasCheckbox";
import Filtrotempo from "../components/FiltroTempo";
import { authFetch } from "../services/auth";

type Usuario = {
  matricula: string;
  nome_usuario: string;
  acessos?: {
    desc_area: string;
  }[];
};

export default function TempoPermanencia() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);  
  const [usuarioAtual, setUsuarioAtual] = useState<Usuario | null>(null);  
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");
  const [portasSelecionadas, setPortasSelecionadas] = useState<string[]>([]);  
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
  const [tempoFim, setTempoFim] = useState<Date | null>(null);

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const res = await authFetch(
          "http://localhost:8000/api/acesso/usuarios/"
        );

        if (!res) return;

        if (!res.ok) {
          throw new Error("Não autorizado");
        }

        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        console.error(error);
      }
    }
    

    carregarUsuarios();
  }, []);

  const portas = Array.from(
    new Set(
      Array.isArray(usuarios)
        ? usuarios.flatMap((u) =>
            u.acessos?.map((a) => a.desc_area) || []
          )
        : []
    )
  );

  function filtrarUsuario(matricula: string) {
    setUsuarioSelecionado(matricula);

    const usuario = usuarios.find(
      (u) => u.matricula === matricula
    );

    setUsuarioAtual(usuario || null);
    setPortasSelecionadas([]);
  }

  return (
    <div>
      <h1>Tempo de Permanência</h1>
      <a href="/upload">
      <button style={{ margin: "0 20px 20px 0" }}>Voltar</button>
      </a>
      <label>Usuário: </label>
      <select
        value={usuarioSelecionado}
        onChange={(e) => filtrarUsuario(e.target.value)}
      >
        <option value="">-- Selecione --</option>

        {usuarios.map((u) => (
          <option key={u.matricula} value={u.matricula}>
            {u.nome_usuario}
          </option>
        ))}
      </select>

      <FiltroPortasCheckbox
        portas={portas}
        selecionadas={portasSelecionadas}
        onChange={setPortasSelecionadas}
      />

      <Filtrotempo
        onChange={(inicio, fim) => {
          setTempoInicio(inicio);
          setTempoFim(fim);
        }}
      />
      <CalculadorTempo
        usuario={usuarioAtual}
        usuarios={usuarios}
        portasSelecionadas={portasSelecionadas}
        tempoInicio={tempoInicio}
        tempoFim={tempoFim}
      />
    </div>
  );
}
