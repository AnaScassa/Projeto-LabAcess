import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export const buscarRegistro = async (
  dataInicio: string | null,
  horaInicio: string | null,
  dataFim: string | null,
  horaFim: string | null
) => {
  const response = await authFetch(`http://${API_HOST}:8000/api/acesso/buscar-registro/`,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data_inicio: dataInicio,
      hora_inicio: horaInicio,
      data_fim: dataFim,
      hora_fim: horaFim,
    }),});

  if (!response.ok) {
    throw new Error(`Erro: ${response.status}`);
  }

  return response.json();
};