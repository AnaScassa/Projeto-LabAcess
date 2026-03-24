import { useUsers } from "../../hooks/useUsers.ts";
import { useTreinamento } from "../../hooks/useTreinamento.ts";
import { useUsuarios } from "../../hooks/useUsuarios.ts"; 
import CalculadorTreinamento from "../../components/relatorios/TreinamentoExpirado.tsx";
import FiltroPortasCheckbox from "../../components/filtros/Checkbox.tsx";
import { useState, useMemo } from "react";
import Menu from "../../components/style/Menu.tsx";


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
      <div className="content-wrapper">
        <div className="content p-4">
          <div className="card">
            <div className="card-header text-center">
              <div className="tituloUltimoMes">
                <h3 className="card-title">Treinamentos expirados</h3>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}