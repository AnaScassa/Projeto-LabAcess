import type { Treinamento } from "../../types/Treinamento";

interface Props {
  treinamentos: Treinamento[];
}

export default function ContagemTreinamento({ treinamentos }: Props) {
  const dataHoje = new Date();

  let datasExpiradas = 0;
  let datasAtivas = 0;

  treinamentos.forEach((t) => {
    const dataExpiracao = new Date(t.expiration_date);

    if (dataExpiracao < dataHoje) {
      datasExpiradas++;
    } else {
      datasAtivas++;
    }
  });

  return (
    <div className="row">
      
      <div className="col-md-6">
        <div className="card" style={{ backgroundColor: "#ffc107" }}>
          <div className="card-body position-relative" style={{ minHeight: "120px" }}>
            
            <div className="text-start w-100 h-100 d-flex flex-column justify-content-start">
              <div className="d-flex w-100 justify-content-start align-items-center" style={{ gap: "10px" }}>
                <h2 style={{ fontWeight: "900", marginBottom: "0" }}>{datasExpiradas}</h2>
              </div>
              <h5>Treinamentos Expirados</h5>
            </div>
            <i className="fas fa-exclamation-triangle position-absolute"
              style={{right: "15px", top: "50%", transform: "translateY(-50%)", fontSize: "3.5rem", color: "rgba(0, 0, 0, 0.3)"}}></i>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card" style={{ backgroundColor: "#17a2b8" }}>
          <div className="card-body position-relative" style={{ minHeight: "120px" }}>
            
            <div className="text-start w-100 h-100 d-flex flex-column justify-content-start">
              <div className="d-flex w-100 justify-content-start align-items-center" style={{ gap: "10px" }}>
                <h2 style={{ fontWeight: "900", marginBottom: "0" }}>{datasAtivas}</h2>
              </div>
              <h5>Treinamentos Ativos</h5>
            </div>
            <i className="fas fa-check-circle position-absolute"
              style={{right: "15px", top: "50%", transform: "translateY(-50%)", fontSize: "3.5rem",color: "rgba(0, 0, 0, 0.3)"}}></i>
          </div>
        </div>
      </div>
    </div>
  );
}