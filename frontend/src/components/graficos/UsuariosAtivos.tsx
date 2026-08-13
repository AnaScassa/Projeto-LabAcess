import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, Tooltip, Legend, Title,} from "chart.js";
import { carregarUsuarios } from "../../services/usuarios";
import { calcularTempoUsuario } from "../../utils/calcularTempoUsuario";
import { minutosParaHoras } from "../../utils/horasMinutos";
import type { Usuario } from "../../types/Usuario";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

function primeiroUltimoNome(nome: string): string {
  if (!nome) return "Sem nome";
  const fatias = nome.trim().split(" ").filter(Boolean);
  if (fatias.length === 0) return "Sem nome";
  if (fatias.length === 1) return fatias[0];
  return `${fatias[0]} ${fatias[fatias.length - 1]}`;
}

export default function GraficosUsuariosAtivos() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const usuarios = await carregarUsuarios();

        const ranking = usuarios
          .map((u: Usuario) => {
            const nome = primeiroUltimoNome( u.nome_usuario || u.matricula || "Sem nome");
            const minutos = calcularTempoUsuario(u, "CCS_LAB", null, null);
            const categoria = u.categoriaUsuario;
            return { usuario: nome, minutos, categoria };
          }).sort((a, b) => b.minutos - a.minutos).slice(0, 6);

        setLabels(ranking.map((item) => item.usuario));
        setValues(ranking.map((item) => item.minutos / 60));
      } catch (err) {
        console.error(err);
        setError("Falha ao carregar ranking de usuários ativos.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <div>Carregando ranking de usuários ativos...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const colors = [
    "#007bff",
    "#dc3545",
    "#fd7e14",
    "#28a745",
    "#6c757d",
    "#17a2b8",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Tempo no CCS_LAB",
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Usuários mais ativos (tempo no CCS_LAB)",
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";

            const minutosTotais = Math.round(context.raw * 60);
            const { horas2, minutos2 } = minutosParaHoras(minutosTotais);

            return `${label}: ${horas2}h ${minutos2}min`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%", padding: 8 }}>
      <Pie data={data} options={options} />
    </div>
  );
}