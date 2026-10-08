import { useEffect, useMemo, useState } from "react";
import { buscarAgendamentosNaoUtilizados, type AgendamentoNaoUtilizado } from "../../services/agendamentosNaoUtilizados";

const AgendamentosNaoUtilizados = () => {
  const [dados, setDados] = useState<AgendamentoNaoUtilizado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resposta = await buscarAgendamentosNaoUtilizados();
        setDados(resposta);
      } catch (error) {
        console.error("Erro ao carregar agendamentos não utilizados:", error);
        setDados([]);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const total = useMemo(() => dados.reduce((acc, item) => acc + item.quantidade, 0), [dados]);

  return (
    <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden">
      <div className="card-header bg-white border-bottom px-4 py-3">
        <div className="d-flex align-items-center">
          <i className="fas fa-solid fa-calendar text-primary me-2"></i>
          <h5 className="mb-0 fw-semibold text-dark">Agendamentos não utilizados</h5>
        </div>
        <small className="text-secondary">Reservas que não tiveram acesso ao CCS_LAB durante o período agendado</small>
      </div>

      <div className="card-body p-3">
        <div className="border rounded-3 p-3 bg-light mb-3">
          <small className="text-secondary d-block mb-1">Total de faltas</small>
          <span className="fw-bold text-warning fs-5">{total}</span>
        </div>

        {carregando ? (
          <div className="text-center py-4 text-secondary">
            <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
            Carregando dados...
          </div>
        ) : dados.length === 0 ? (
          <div className="alert alert-light border mb-0 text-center text-secondary">
            Nenhum agendamento não utilizado encontrado.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-3 py-2 text-secondary small text-uppercase fw-semibold">Usuário</th>
                  <th className="px-3 py-2 text-secondary small text-uppercase fw-semibold text-center">Faltas</th>
                </tr>
              </thead>

              <tbody>
                {dados.map((item) => (
                  <tr key={item.matricula}>
                    <td className="px-3 py-3">
                      <div className="fw-semibold text-dark">{item.usuario}</div>
                      <small className="text-secondary">{item.matricula}</small>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="badge bg-warning-subtle text-warning rounded-pill px-2 py-2">{item.quantidade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendamentosNaoUtilizados;