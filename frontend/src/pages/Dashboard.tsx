import UsoIndevidoCartao from "../components/relatorios/UsoIndevidoCartao";
import ContagemTreinamento from "../components/style/ContagemTreinamento";
import Menu from "../components/style/Menu";
import AcessoIndevidos from "../components/relatorios/AcessosIndevidos";
import UltimosAcessos from "../components/relatorios/UltimosAcessos";
import Cruzamentos from "../components/relatorios/Cruzamentos";
import StatusAluno from "../components/relatorios/StatusUsuario";
import { useTreinamento } from "../hooks/useTreinamento";

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
                    <Cruzamentos />
                  </div>
                </div>
                <AcessoIndevidos />
            </div>
        </section>

      </div>
    </div>
  );
}
