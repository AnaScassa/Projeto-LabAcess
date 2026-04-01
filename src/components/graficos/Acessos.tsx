import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,} from "chart.js";
import { carregarUsuarios } from "../../services/usuarios";
import type { Usuario } from "../../types/Usuario";

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

        const monthHours = new Map<string, number>();
        const PORTA_LAB = "CCS_LAB";

        usuarios.forEach((user: Usuario) => {
          const acessosLab = (user.acessos ?? [])
            .filter((acesso) => acesso.desc_area === PORTA_LAB)
            .map((acesso) => ({ ...acesso, dataHora: new Date(acesso.data_acesso) }))
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
                  const horas = minutos / 60;
                  monthHours.set(monthKey, (monthHours.get(monthKey) ?? 0) + horas);
                }
                entrada = null;
              }
            }
          });
        });

        const sortedMonthKeys = Array.from(monthHours.keys()).sort();

        setLabels(sortedMonthKeys.map(formatMonthLabel));
        setValues(sortedMonthKeys.map((key) => Number((monthHours.get(key) ?? 0).toFixed(2))));
      } catch (err) {
        console.error(err);
        setError("Falha ao carregar dados de acessos.");
      } finally {
        setLoading(false);
      }
    }

    loadChart();
  }, []);

  if (loading) return <div>Carregando gráfico de acessos por mês...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const data = {
    labels,
    datasets: [
      {
        label: "Acessos (horas)",
        data: values,
        backgroundColor: "#007bff",
        borderColor: "#17a2b8",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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
