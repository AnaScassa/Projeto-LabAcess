import { useUsers } from "../../hooks/useUsers";
import { useTreinamento } from "../../hooks/useTreinamento";
import CalculadorTreinamentoPendente from "../../components/relatorios/TreinamentoPendente";
import Menu from "../../components/style/Menu";

export default function RelatorioTreinamentoPendente() {
  const { users } = useUsers();
  const { treinamentos } = useTreinamento();

  return (
    <div className="wrapper">
      <Menu/>

      <div className="content-wrapper">
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
          <i className="fas fa-hourglass-half text-primary me-2" style={{fontSize: "35px"}}></i>
          <h2 className="mb-0 fw-semibold text-dark">Treinamentos Pendentes</h2>
        </div>

        <small className="text-secondary px-4 pt-0 pb-2">
          Consulte os usuários que possuem treinamentos pendentes
        </small>

        <section className="content px-4 pt-3">
          <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">

            <div className="card-header bg-white border-bottom px-4 py-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-hourglass-half text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Treinamentos pendentes</h5>
              </div>

              <small className="text-secondary">
                Usuários que ainda possuem treinamentos a serem realizados
              </small>
            </div>

            <CalculadorTreinamentoPendente
              users={users}
              treinamentos={treinamentos}
            />

          </div>
        </section>
      </div>
    </div>
  );
}