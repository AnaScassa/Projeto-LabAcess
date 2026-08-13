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
    
    return(
        <div className="wrapper">
            <Menu/>
            <div className="content-wrapper">
                <div className="content p-4">
                    <div className="card">
                        <div className="card-header text-center">
                            <div className="tituloUltimoMes">
                                <h3 className="card-title">Usuários que não acessaram o lab</h3>
                            </div>
                            <br/>
                            <FiltroCategoriaCheckbox selecionadas={categoriasSelecionadas} onChange={(novas) => setCategoriasSelecionadas(novas)}/>
                            <br/>
                            <Filtrotempo onChange={(inicio, fim) => {setTempoInicio(inicio); setTempoFim(fim);}}/>
                            <SemAcesso usuarios={usuarios} tempoInicio={tempoInicio} tempoFim={tempoFim} categoriasSelecionadas={categoriasSelecionadas}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
