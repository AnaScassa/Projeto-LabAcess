import { useState, useMemo } from "react";
import { useUsers } from "../../hooks/useUsers";
import { useTreinamento } from "../../hooks/useTreinamento";
import { useUsuarios } from "../../hooks/useUsuarios";
import CalculadorNaoExpirados from "../../components/relatorios/Treinamento";
import FiltroPortasCheckbox from "../../components/filtros/Checkbox";
import Menu from "../../components/style/Menu";


export default function RelatorioNaoExpirados() {
  const { users } = useUsers();
  const { treinamentos } = useTreinamento();
  const { usuarios } = useUsuarios();
  const [portasSelecionadas, setPortasSelecionadas] = useState<string[]>([]);

  const portas = useMemo(() => {
    return Array.from(new Set(Array.isArray(usuarios) ? usuarios.flatMap((u) => u.acessos?.map((a) => a.desc_area) || []): []));
  }, [usuarios]);

  return (
    <div className="wrapper">
      <Menu/>

      <div className="content-wrapper">
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
          <i className="fas fa-graduation-cap text-primary me-2" style={{fontSize: "35px"}}></i>
          <h2 className="mb-0 fw-semibold text-dark">Treinamentos não expirados</h2>
        </div>

        <small className="text-secondary px-4 pt-0 pb-2">Consulte os usuários com treinamentos ativos e seus níveis de acesso ao laboratório</small>

        <section className="content px-4 pt-3">
          <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">

            <div className="card-header bg-white border-bottom px-4 py-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-graduation-cap text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Treinamentos não expirados</h5>
              </div>

              <small className="text-secondary">Filtre pelas portas de acesso para consultar os usuários</small>
            </div>

            <div className="card-body px-4 py-4">
              <FiltroPortasCheckbox portas={portas} selecionadas={portasSelecionadas} onChange={setPortasSelecionadas}/>
            </div>

            <CalculadorNaoExpirados users={users} usuarios={usuarios} treinamentos={treinamentos} portasSelecionadas={portasSelecionadas}/>

          </div>
        </section>
      </div>
    </div>
  );
}
