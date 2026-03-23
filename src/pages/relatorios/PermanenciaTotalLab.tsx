import { useState } from "react";
import { useUsuarios } from "../../hooks/useUsuarios";
import CalculadorLab from "../../components/relatorios/Laboratorio";
import Filtrotempo from "../../components/filtros/FiltroTempo";
import BotaoVoltar from "../../components/style/BotaoVoltar";
import Menu from "../../components/style/Menu";


export default function RelatorioTempo() {
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
  const [tempoFim, setTempoFim] = useState<Date | null>(null);
  const { usuarios } = useUsuarios();

  return (
    <div className="wrapper">
      <Menu/>
      <div className="content-wrapper">
        <div className="content p-4">
          <BotaoVoltar/>
          <div className="card">
            <div className="card-header text-center">
              <div className="tituloUltimoMes">
                <h3 className="card-title">Relatório de Permanência do Lab</h3>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}