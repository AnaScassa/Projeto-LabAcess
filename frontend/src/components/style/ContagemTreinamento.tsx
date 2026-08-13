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

      <div className="col-md-4">
        <div className="card" style={{ backgroundColor: "#dc3545" }}>
          <div className="card-body position-relative" style={{ minHeight: "120px" }}>
            
            <div className="text-start w-100 h-100 d-flex flex-column justify-content-start">
              <div className="d-flex w-100 justify-content-start align-items-center" style={{ gap: "10px" }}>
                <h2 style={{ fontWeight: "900", marginBottom: "0" }}>{datasExpiradas}</h2>
              </div>
              <h5>Treinamentos Expirados</h5>
            </div>
            <i className="fas fa-exclamation-triangle position-absolute card-icon"
              style={{ right: "15px", top: "50%", fontSize: "3.5rem", color: "rgba(0, 0, 0, 0.3)" }}>
            </i>
          </div>

          <Link to="/relatorioTreinamento" className="small-box-footer d-flex justify-content-center py-1 align-items-center info-link"
            style={{ color: "#000", textDecoration: 'none', cursor: "pointer" }}>
            Mais informações <i className="fas fa-arrow-circle-right pl-1"></i>
          </Link>
          
        </div>
      </div>

      <div className="col-md-4">
        <div className="card" style={{ backgroundColor: "#ffc107"}}>
          <div className="card-body position-relative" style={{ minHeight: "120px" }}>
            
            <div className="text-start w-100 h-100 d-flex flex-column justify-content-start">
              <h2 style={{ fontWeight: "900" }}>{datasSemData}</h2>
              <h5>Treinamentos Pendentes</h5>
            </div>

            <i className="fas fa-solid fa-clock position-absolute card-icon"
              style={{ right: "15px", top: "50%", fontSize: "3.5rem", color: "rgba(0, 0, 0, 0.3)", gap: "8px"  }}>
            </i>
          </div>

          <Link to="/relatorioTreinamentoPendente" className="small-box-footer d-flex justify-content-center py-1 align-items-center info-link"
            style={{ color: "#000", textDecoration: 'none', cursor: "pointer" }}>
            Mais informações <i className="fas fa-arrow-circle-right pl-1"></i>
          </Link>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card" style={{ backgroundColor: "#17a2b8" }}>
          <div className="card-body position-relative" style={{ minHeight: "120px" }}>
            
            <div className="text-start w-100 h-100 d-flex flex-column justify-content-start">
              <h2 style={{ fontWeight: "900" }}>{datasAtivas}</h2>
              <h5>Treinamentos Ativos</h5>
            </div>
            <i className="fas fa-check-circle position-absolute card-icon"
              style={{ right: "15px", top: "50%", fontSize: "3.5rem", color: "rgba(0, 0, 0, 0.3)", gap: "8px" }}>
            </i>
          </div>
          <Link to="/relatorioNaoExpirados" className="small-box-footer d-flex justify-content-center py-1 align-items-center info-link"
            style={{ color: "#000", textDecoration: 'none', cursor: "pointer" }}>
            Mais informações <i className="fas fa-arrow-circle-right pl-1"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}