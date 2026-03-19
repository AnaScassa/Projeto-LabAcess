import { useUsers } from "../hooks/useUsers";
import { useTreinamento } from "../hooks/useTreinamento";
import { useUsuarios } from "../hooks/useUsuarios"; 
import CalculadorTreinamento from "../components/logicas/CalculadorTreinamento.tsx";
import BotaoVoltar from "../components/style/BotaoVoltar.tsx";
import FiltroPortasCheckbox from "../components/logicas/FiltroPortasCheckbox";
import { useState, useMemo } from "react";


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
    <div>
      <h1>Treinamentos expirados</h1>

      <BotaoVoltar />

      <FiltroPortasCheckbox
        portas={portas}
        selecionadas={portasSelecionadas}
        onChange={setPortasSelecionadas}
      />

      <CalculadorTreinamento
        users={users}
        usuarios={usuarios}   
        treinamentos={treinamentos}
        portasSelecionadas={portasSelecionadas}
      />
    </div>
  );
}