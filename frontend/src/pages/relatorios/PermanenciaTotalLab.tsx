import { useState } from "react";
import { useUsuarios } from "../../hooks/useUsuarios";
import CalculadorLab from "../../components/relatorios/Laboratorio";
import Filtrotempo from "../../components/filtros/FiltroTempo";
import Menu from "../../components/style/Menu";
import FiltroCategoriaCheckbox from "../../components/filtros/CategoriaCheckbox";

export default function RelatorioTempo() {
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
  const [tempoFim, setTempoFim] = useState<Date | null>(null);
  const { usuarios } = useUsuarios();
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);

  return (
    <div className="wrapper">
      <Menu/>

      <div className="content-wrapper">
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
          <i className="fas fa-clock text-primary me-2" style={{fontSize: "35px"}}></i>
          <h2 className="mb-0 fw-semibold text-dark">Relatório de Permanência</h2>
        </div>

        <small className="text-secondary px-4 pt-0 pb-2">Consulte o tempo de permanência dos usuários no laboratório</small>

        <section className="content px-4 pt-3">
          <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">

            <div className="card-header bg-white border-bottom px-4 py-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-clock text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Relatório de Permanência do Lab</h5>
              </div>
              <small className="text-secondary">Filtre por categoria e período para consultar o tempo de permanência</small>
            </div>

            <div className="card-body px-4 py-4">
              <div className="d-flex flex-column" style={{gap: "20px"}}>
                <FiltroCategoriaCheckbox selecionadas={categoriasSelecionadas} onChange={(novas) => setCategoriasSelecionadas(novas)}/>
                <Filtrotempo onChange={(inicio, fim) => {setTempoInicio(inicio); setTempoFim(fim);}}/>
              </div>
            </div>

            <CalculadorLab usuarios={usuarios} tempoInicio={tempoInicio} tempoFim={tempoFim} categoriasSelecionadas={categoriasSelecionadas}/>

          </div>
        </section>
      </div>
    </div>
  );
}