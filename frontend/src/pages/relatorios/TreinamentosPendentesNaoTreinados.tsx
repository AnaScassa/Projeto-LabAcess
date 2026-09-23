import { useUsuarios } from "../../hooks/useUsuarios";
import { useTreinamento } from "../../hooks/useTreinamento";
import Menu from "../../components/style/Menu";
import UsuariosSemTreinamento from "../../components/relatorios/TreinamentosPendentesNaoTreinados";
import { useUsers } from "../../hooks/useUsers";

export default function TreinamentosPendentesNaoTreinados() {
  const { usuarios } = useUsuarios();
  const { treinamentos } = useTreinamento();
  const { users } = useUsers();

  return (
    <div className="wrapper">
      <Menu />

      <div className="content-wrapper">
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
          <i className="fas fa-user-graduate text-primary me-2" style={{fontSize: "35px"}}></i>
          <h2 className="mb-0 fw-semibold text-dark">Treinamentos Pendentes Não Treinados</h2>
        </div>

        <small className="text-secondary px-4 pt-0 pb-2">Consulte os usuários que ainda não possuem treinamento e seus acessos ao laboratório</small>

        <section className="content px-4 pt-3">
          <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">
            <div className="card-header bg-white border-bottom px-4 py-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-user-graduate text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Usuários sem treinamento</h5>
              </div>

              <small className="text-secondary">Usuários que possuem acessos ao laboratório, mas ainda não realizaram treinamento</small>
            </div>

            <UsuariosSemTreinamento usuarios={usuarios} users={users} treinamentos={treinamentos} />
          </div>
        </section>
      </div>
    </div>
  );
}