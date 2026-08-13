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
          <div className="content p-4">
            <div className="card">
              <div className="card-header text-center">
                <div className="tituloUltimoMes">
                  <h3 className="card-title">Relatório do último mês lab</h3>
                </div>
                <p className="card-subtitle text-muted">Período: {umMesAtras.toLocaleDateString()} - {hoje.toLocaleDateString()}</p>
                <br/>
                <FiltroCategoriaCheckbox selecionadas={categoriasSelecionadas} onChange={(novas) => setCategoriasSelecionadas(novas)}/>
                <br/>
                <FiltroRecente usuarios={usuarios} categoriasSelecionadas={categoriasSelecionadas}/>
              </div>
            </div>
          </div>
        </div>
      </div>

    );
}