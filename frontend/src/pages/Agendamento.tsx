import Menu from "../components/style/Menu";
import AcessosAgendados from "../components/relatorios/AcessosAgendados";
import AgendamentosNaoUtilizados from "../components/relatorios/AgendamentosNaoUtilizados";
import Cruzamentos from "../components/relatorios/Cruzamentos";

export default function Agendamento() {
  return (
    <div className="wrapper">
      <Menu />

      <div className="content-wrapper">
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
          <i className="fas fa-calendar text-primary me-2" style={{ fontSize: "35px" }} />
          <h2 className="mb-0 fw-semibold text-dark">Agendamentos MRBS</h2>
        </div>
        <small className="text-secondary px-4 pt-0 pb-2">Relatórios de Agendamentos feitos na plataforma MRBS</small>

        <section className="content px-4 pt-4">
          <div className="row g-4">
            <div className="col-md-6">
              <AcessosAgendados />
            </div>
            <div className="col-md-6">
              <AgendamentosNaoUtilizados />
            </div>
          </div>
        </section>

        <section className="content px-4">
          <div className="row">
            <div className="col-md-12 pb-4">
              <Cruzamentos paginacao mostrarCabecalho />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}