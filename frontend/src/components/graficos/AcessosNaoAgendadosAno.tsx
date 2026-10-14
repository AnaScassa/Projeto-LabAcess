import { Bar } from "react-chartjs-2";
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  labels: string[];
  valores: number[];
  escalaMaxima: number;
}

export default function AcessosNaoAgendadosAno({ labels, valores, escalaMaxima }: Props) {
  const data = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: "#dc3545",
        borderColor: "#dc3545",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: escalaMaxima,
        ticks: { precision: 0 },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
