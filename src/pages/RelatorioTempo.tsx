import { useState } from "react";
import { useUsuarios } from "../hooks/useUsuarios";
import CalculadorLab from "../components/logicas/CalculadorLab";
import Filtrotempo from "../components/logicas/FiltroTempo";
import BotaoVoltar from "../components/style/BotaoVoltar";

export default function RelatorioTempo() {
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
  const [tempoFim, setTempoFim] = useState<Date | null>(null);
  const { usuarios } = useUsuarios();

  return (
    <div>
      <h1>Relatório de Permanência do Lab</h1>
      <BotaoVoltar/>
      <Filtrotempo onChange={(inicio, fim) => {
          setTempoInicio(inicio);
          setTempoFim(fim);
        }}/>

      <CalculadorLab
        usuarios={usuarios}
        tempoInicio={tempoInicio}
        tempoFim={tempoFim}
      />
    </div>
  );
}