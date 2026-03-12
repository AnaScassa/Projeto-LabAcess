import { useUsuarios } from "../hooks/useUsuarios";
import FiltroRecente from "../components/logicas/FiltroRecente";
import BotaoVoltar from "../components/style/BotaoVoltar";

export default function RelatorioRecente(){
  const { usuarios } = useUsuarios();

    return (
      <div>
        <h1>Relatório do último mês lab</h1>
        <BotaoVoltar/>
        <FiltroRecente usuarios={usuarios}/>
      </div>
    );
}