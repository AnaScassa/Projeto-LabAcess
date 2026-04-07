import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,} from "chart.js";
import { carregarUsuarios } from "../../services/usuarios";
import type { Usuario } from "../../types/Usuario";
import { minutosParaHoras } from "../../utils/horasMinutos";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return monthKey;
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export default function GraficoAcessos() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);

  useEffect(() => {
    async function loadChart() {
      setLoading(true);
      setError(null);

      try {
        const usuarios = await carregarUsuarios();

        const monthMinutes = new Map<string, number>();
        const PORTA_LAB = "CCS_LAB";

        usuarios.forEach((user: Usuario) => {
          const acessosLab = (user.acessos ?? [])
            .filter((acesso) => acesso.desc_area === PORTA_LAB)
            .map((acesso) => ({ ...acesso, dataHora: new Date(acesso.data_acesso), }))
            .filter((acesso) => !Number.isNaN(acesso.dataHora.getTime()))
            .sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());

          let entrada: Date | null = null;

          acessosLab.forEach((acesso) => {
            if (acesso.ent_sai === "1") {
              entrada = acesso.dataHora;
            } else {
              if (entrada) {
                const minutos = Math.floor((acesso.dataHora.getTime() - entrada.getTime()) / 60000);
                if (minutos > 0 && minutos <= 600) {
                  const monthKey = `${entrada.getFullYear()}-${String(entrada.getMonth() + 1).padStart(2, "0")}`;
                  monthMinutes.set(monthKey,(monthMinutes.get(monthKey) ?? 0) + minutos);
                }

                entrada = null;
              }
            }
          });
        });

        const anoAtual = new Date().getFullYear();
        const anoDesejado = anoAtual - 1;
        const filteredMonthKeys = Array.from(monthMinutes.keys())
          .filter((key) => {
            const [year] = key.split("-").map(Number);
            return year === anoDesejado;
          })
          .sort();

        setLabels(filteredMonthKeys.map(formatMonthLabel));
        setValues(filteredMonthKeys.map((key) =>(monthMinutes.get(key) ?? 0) / 60));

      } catch (err) {
        console.error(err);
        setError("Falha ao carregar dados de acessos.");
      } finally {
        setLoading(false);
      }
    }

    loadChart();
  }, []);

  if (loading) return <div>Carregando gráfico dos acessos do último ano</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const data = {
    labels,
    datasets: [
      {
        label: "Acessos (horas)",
        data: values,
        backgroundColor: "#17a2b8",
        borderColor: "#17a2b8",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const minutosTotais = Math.round(context.raw * 60);
            const { horas2, minutos2 } = minutosParaHoras(minutosTotais);
            return `${horas2}h ${minutos2}min`;
          },
        },
      },
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Horas no CCS_LAB por mês",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%", padding: 8 }}>
      <Bar data={data} options={options} />
    </div>
  );
}