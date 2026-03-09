import { useEffect, useState } from "react";
import CalculadorLab from "../components/CalculadorLab";
import Filtrotempo from "../components/FiltroTempo";
import { authFetch } from "../services/auth";

type Usuario = {
  matricula: string;
  nome_usuario: string;
  acessos?: {
    desc_area: string;
    data_acesso: string;
    ent_sai: string;
  }[];
};

export default function RelatorioTempo() {

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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
      }
    }

    carregarUsuarios();

  }, []);

  return (
    <div>

      <h1>Relatório de Permanência do Lab</h1>

      <a href="/upload">
        <button style={{ margin: "0 20px 20px 0" }}>
          Voltar
        </button>
      </a>

      <Filtrotempo
        onChange={(inicio, fim) => {
          setTempoInicio(inicio);
          setTempoFim(fim);
        }}
      />

      <CalculadorLab
        usuarios={usuarios}
        tempoInicio={tempoInicio}
        tempoFim={tempoFim}
      />

    </div>
  );
}