import { Link } from "react-router";
import type { Treinamento } from "../../types/Treinamento";

interface Props {
  treinamentos: Treinamento[];
}

export default function ContagemTreinamento({ treinamentos }: Props) {
  const dataHoje = new Date();

  let datasExpiradas = 0;
  let datasAtivas = 0;
  let datasSemData = 0;

  treinamentos.forEach((t) => {
    if (!t.expiration_date) {
      datasSemData++;
      return;
    }

    const dataExpiracao = new Date(t.expiration_date);

    if (isNaN(dataExpiracao.getTime())) {
      datasSemData++;
    } else if (dataExpiracao < dataHoje) {
      datasExpiradas++;
    } else {
      datasAtivas++;
    }
  });
  return (
    <div className="row">

      <div className="col-12 col-md-4 pt-2">
        <div className="training-card training-card-danger">
          <div className="training-card-body">
            <div>

              <div className="training-card-title">
                <span className="training-icon">
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: '0px' }}></i>
                </span>
                <span>Treinamentos Expirados</span>
              </div>

              <div className="training-card-number pl-2">
                {datasExpiradas}
              </div>

            </div>
          </div>

          <Link to="/relatorioTreinamento" className="training-card-footer">
            <span>Ver relatório</span>
            <i className="fas fa-arrow-right"></i>
          </Link>

        </div>
      </div>

      <div className="col-12 col-md-4 pt-2">
        <div className="training-card training-card-warning">
          <div className="training-card-body ">
            <div>

              <div className="training-card-title">
                <span className="training-icon">
                  <i className="fas fa-clock" style={{ marginRight: '0px' }}></i>
                </span>
                <span>Treinamentos Pendentes</span>
              </div>

              <div className="training-card-number pl-2">
                {datasSemData}
              </div>

            </div>
          </div>

          <Link to="/relatorioTreinamentoPendente" className="training-card-footer">
            <span>Ver relatório</span>
            <i className="fas fa-arrow-right"></i>
          </Link>

          </div>
        </div>

        <div className="col-12 col-md-4 pt-2">
          <div className="training-card training-card-info">
            <div className="training-card-body">
              <div>

                <div className="training-card-title">
                  <span className="training-icon">
                    <i className="fas fa-check-circle" style={{ marginRight: '0px' }}></i>
                  </span>
                  <span>Treinamentos Ativos</span>
                </div>

                <div className="training-card-number pl-2">
                  {datasAtivas}
                </div>

              </div>
            </div>

            <Link to="/relatorioNaoExpirados" className="training-card-footer">
              <span>Ver relatório</span>
              <i className="fas fa-arrow-right"></i>
            </Link>

          </div>
        </div>
      </div>
  );
}