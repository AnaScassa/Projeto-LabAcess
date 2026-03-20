import { useUsers } from "../hooks/useUsers";
import { useTreinamento } from "../hooks/useTreinamento";
import { useUsuarios } from "../hooks/useUsuarios"; 
import CalculadorTreinamento from "../components/relatorios/TreinamentoExpirado.tsx";
import BotaoVoltar from "../components/style/BotaoVoltar.tsx";
import FiltroPortasCheckbox from "../components/filtros/Checkbox.tsx";
import { useState, useMemo } from "react";
import Menu from "../components/style/Menu";


export default function RelatorioTreinamento() {

  const { users } = useUsers();            
  const { treinamentos } = useTreinamento(); 
  const { usuarios } = useUsuarios();      

  const [portasSelecionadas, setPortasSelecionadas] = useState<string[]>([]);  

  const portas = useMemo(() => {
    return Array.from(
      new Set(
        Array.isArray(usuarios)
          ? usuarios.flatMap((u) =>
              u.acessos?.map((a) => a.desc_area) || []
            )
          : []
      )
    );
  }, [usuarios]);

  return (
    <div className="wrapper">
      <Menu/>
      <h1>Treinamentos expirados</h1>

      <BotaoVoltar />

      <FiltroPortasCheckbox
        portas={portas}
        selecionadas={portasSelecionadas}
        onChange={setPortasSelecionadas}
      /> <br /> <br />

      <CalculadorTreinamento
        users={users}
        usuarios={usuarios}   
        treinamentos={treinamentos}
        portasSelecionadas={portasSelecionadas}
      />
    </div>
  );
}