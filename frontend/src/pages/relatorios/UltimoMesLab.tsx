import { useState } from "react";
import { useUsuarios } from "../../hooks/useUsuarios";
import FiltroRecente from "../../components/relatorios/UltimoMes";
import Menu from "../../components/style/Menu";
import FiltroCategoriaCheckbox from "../../components/filtros/CategoriaCheckbox";


export default function RelatorioRecente(){
  const { usuarios } = useUsuarios();
  const hoje = new Date();
  const umMesAtras = new Date();
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);

  umMesAtras.setMonth(hoje.getMonth() - 1);

  return (
    <div className="wrapper">
      <Menu/>

      <div className="content-wrapper">
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
          <i className="fas fa-chart-line text-primary me-2" style={{fontSize: "35px"}}></i>
          <h2 className="mb-0 fw-semibold text-dark">Relatório do Último Mês</h2>
        </div>

        <small className="text-secondary px-4 pt-0 pb-2">
          Período: {umMesAtras.toLocaleDateString()} - {hoje.toLocaleDateString()}
        </small>

        <section className="content px-4 pt-3">
          <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">

            <div className="card-header bg-white border-bottom px-4 py-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-calendar-alt text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Relatório do último mês lab</h5>
              </div>

              <small className="text-secondary">Consulte a permanência dos usuários no laboratório durante o período selecionado</small>
            </div>

            <div className="card-body px-4 py-4">
              <FiltroCategoriaCheckbox selecionadas={categoriasSelecionadas} onChange={(novas) => setCategoriasSelecionadas(novas)}/>
            </div>

            <FiltroRecente usuarios={usuarios} categoriasSelecionadas={categoriasSelecionadas}/>

          </div>
        </section>
      </div>
    </div>
  );
}