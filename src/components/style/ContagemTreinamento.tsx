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
        <div className="card">
          <div className="card-body d-flex flex-column justify-content-center align-items-center">
            <h5>Total de Treinamentos Expirados</h5>
            <h2>{datasExpiradas}</h2>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card">
          <div className="card-body d-flex flex-column justify-content-center align-items-center">
            <h5>Total de Treinamentos Ativos</h5>
            <h2>{datasAtivas}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}