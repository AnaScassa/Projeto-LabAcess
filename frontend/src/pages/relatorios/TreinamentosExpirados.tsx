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
    return Array.from(new Set(Array.isArray(usuarios) ? usuarios.flatMap((u) => u.acessos?.map((a) => a.desc_area) || []) : []));
  }, [usuarios]);

  return (
    <div className="wrapper">
      <Menu/>

      <div className="content-wrapper">
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
          <i className="fas fa-calendar-times text-primary me-2" style={{fontSize: "35px"}}></i>
          <h2 className="mb-0 fw-semibold text-dark">Treinamentos Expirados</h2>
        </div>

        <small className="text-secondary px-4 pt-0 pb-2">Consulte os usuários com treinamentos expirados e seus acessos posteriores</small>

        <section className="content px-4 pt-3">
          <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">

            <div className="card-header bg-white border-bottom px-4 py-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-calendar-times text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Treinamentos expirados</h5>
              </div>

              <small className="text-secondary">Filtre pelas portas de acesso para consultar os treinamentos expirados</small>
            </div>

            <div className="card-body px-4 py-4">
              <FiltroPortasCheckbox portas={portas} selecionadas={portasSelecionadas} onChange={setPortasSelecionadas}/>
            </div>

            <CalculadorTreinamento users={users} usuarios={usuarios} treinamentos={treinamentos} portasSelecionadas={portasSelecionadas}/>

          </div>
        </section>
      </div>
    </div>
  );
}