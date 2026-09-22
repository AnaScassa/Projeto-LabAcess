import { useState } from "react";
import { useUsuarios } from "../../hooks/useUsuarios";
import Filtrotempo from "../../components/filtros/FiltroTempo";
import SemAcesso from "../../components/relatorios/SemAcesso";
import Menu from "../../components/style/Menu";
import FiltroCategoriaCheckbox from "../../components/filtros/CategoriaCheckbox";

export default function NaoAcessantes(){    
    const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
    const [tempoFim, setTempoFim] = useState<Date | null>(null);
    const { usuarios } = useUsuarios();
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
    
    return (
    <div className="wrapper">
        <Menu/>

        <div className="content-wrapper">
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
            <i className="fas fa-user-clock text-primary me-2" style={{fontSize: "35px"}}></i>
            <h2 className="mb-0 fw-semibold text-dark">Usuários sem acesso</h2>
        </div>

        <small className="text-secondary px-4 pt-0 pb-2">Consulte os usuários que não acessaram o laboratório no período selecionado</small>

        <section className="content px-4 pt-3">
            <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">
            <div className="card-header bg-white border-bottom px-4 py-3">
                <div className="d-flex align-items-center">
                <i className="fas fa-user-slash text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Usuários que não acessaram o laboratório</h5>
                </div>
                <small className="text-secondary">Filtre por categoria e período para consultar os acessos</small>
            </div>

            <div className="card-body px-4 py-4">
                <div className="d-flex flex-column" style={{gap: "20px"}}>
                <FiltroCategoriaCheckbox selecionadas={categoriasSelecionadas} onChange={(novas) => setCategoriasSelecionadas(novas)}/>
                <Filtrotempo onChange={(inicio, fim) => {setTempoInicio(inicio); setTempoFim(fim);}}/>
                </div>
            </div>

            <SemAcesso usuarios={usuarios} tempoInicio={tempoInicio} tempoFim={tempoFim} categoriasSelecionadas={categoriasSelecionadas}/>
            
            </div>
        </section>
        </div>
    </div>
    );
}
