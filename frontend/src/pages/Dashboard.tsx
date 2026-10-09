import UsoIndevidoCartao from "../components/relatorios/UsoIndevidoCartao";
import ContagemTreinamento from "../components/style/ContagemTreinamento";
import Menu from "../components/style/Menu";
import AcessoIndevidos from "../components/relatorios/AcessosIndevidos";
import UltimosAcessos from "../components/relatorios/UltimosAcessos";
import Cruzamentos from "../components/relatorios/Cruzamentos";
import StatusAluno from "../components/relatorios/StatusUsuario";
import { useTreinamento } from "../hooks/useTreinamento";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { treinamentos } = useTreinamento();  

  return (
    <div className="wrapper">
      <Menu />

    <div className="content-wrapper">
        <div className="px-4 pt-3 pb-2">
            <div className="icon-dashboard d-flex align-items-center">
                <i className="fas fa-chart-line text-primary me-2" style={{ fontSize: "35px" }} ></i>
                <h2 className="mb-0 fw-semibold text-dark">Dashboard</h2>
            </div>
            <small className="text-secondary">
                Controle e acompanhamento dos acessos ao laboratório
            </small>
        </div>

        <section className="content px-4 pt-2 pb-4">
            <ContagemTreinamento treinamentos={treinamentos} />
        </section>

        <section className="content px-4">
          <StatusAluno />
        </section>

        <section className="content px-4">
          <div className="row">
            <div className="col-md-6 pb-4">
              <div className="card m-0" style={{ height: "400px" }}>
                <UltimosAcessos />
              </div>
            </div>
            <UsoIndevidoCartao />
          </div>
        </section>

        <section className="content px-4">
            <div className="row">
                <div className="col-md-6 pb-4">
                  <div className="card">
                    <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0" style={{ height: "400px" }}>
                      <div className="card-header bg-white border-bottom px-4 py-3">
                        <div>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-unlink text-primary me-2"></i>
                            <h5 className="mb-0 fw-semibold text-dark">Acessos sem Agendamento</h5>
                          </div>
                          <small className="text-secondary">Acessos identificados sem registro no agendamento MRBS</small>
                        </div>
                      </div>
                      <Cruzamentos />
                      <div className="card-footer bg-light border-0 px-4 py-3 d-flex justify-content-end align-items-center">
                        <Link to="/agendamento" className="text-decoration-none">
                          <p className="text-primary small mb-0" style={{ cursor: "pointer" }}>Ver mais <i className="fas fa-arrow-right ms-1"></i></p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <AcessoIndevidos />
            </div>
        </section>

      </div>
    </div>
  );
}
