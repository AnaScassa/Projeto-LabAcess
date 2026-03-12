import { useState } from "react";
import { useUsuarios } from "../hooks/useUsuarios";
import Filtrotempo from "../components/logicas/FiltroTempo";
import SemAcesso from "../components/logicas/SemAcesso";
import BotaoVoltar from "../components/style/BotaoVoltar";

export default function NaoAcessantes(){    
    const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
    const [tempoFim, setTempoFim] = useState<Date | null>(null);
    const { usuarios } = useUsuarios();

    return(
        <div>
            <h1>Usuários que não acessaram o lab</h1>
            <BotaoVoltar/>
            
            <Filtrotempo onChange={(inicio, fim) => {
                setTempoInicio(inicio);
                setTempoFim(fim);
            }}/>
            <SemAcesso
                usuarios={usuarios}
                tempoInicio={tempoInicio}
                tempoFim={tempoFim} />
        </div>
    );
}