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

interface GraficoAcessosProps {
  selectedYear: number | null;
  onYearsAvailable: (years: number[], initialYear: number | null) => void;
}

export default function GraficoAcessos({
  selectedYear,
  onYearsAvailable,
}: GraficoAcessosProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthMinutes, setMonthMinutes] = useState<Map<string, number>>(new Map());

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
            .flatMap((acesso) => acesso.data_acesso ? [{ ...acesso, dataHora: new Date(acesso.data_acesso) }] : [])
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

        const years = [...new Set(
          Array.from(monthMinutes.keys(), (key) => Number(key.split("-")[0])),
        )].sort((a, b) => b - a);
        const previousYear = new Date().getFullYear() - 1;

        setMonthMinutes(monthMinutes);
        onYearsAvailable(years, years.includes(previousYear) ? previousYear : (years[0] ?? null));

      } catch (err) {
        console.error(err);
        setError("Falha ao carregar dados de acessos.");
      } finally {
        setLoading(false);
      }
    }

    loadChart();
  }, [onYearsAvailable]);

  if (loading) return <div>Carregando gráfico dos acessos...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const labels = MONTH_NAMES;
  const values = MONTH_NAMES.map((_, index) => {
    const monthKey = `${selectedYear}-${String(index + 1).padStart(2, "0")}`;
    return (monthMinutes.get(monthKey) ?? 0) / 60;
  });

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
        text: `Horas no CCS_LAB por mês${selectedYear === null ? "" : ` - ${selectedYear}`}`,
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
    <div style={{ width: "100%", height: "100%", padding: 8, display: "flex", flexDirection: "column" }}>
      {selectedYear === null ? (
        <div className="d-flex flex-grow-1 justify-content-center align-items-center text-muted text-center">
          Não há dados de acessos ao CCS_LAB para exibir.
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0 }}>
          <Bar data={data} options={options} />
        </div>
      )}
    </div>
  );
}