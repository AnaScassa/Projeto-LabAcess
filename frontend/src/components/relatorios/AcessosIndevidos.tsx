import { useApontamento } from "../../hooks/useApontamento";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useApontamentoActions } from "../../hooks/useDesativamento";
import type { Apontamento } from "../../types/Apontamento";
import type { Usuario } from "../../types/Usuario";

export default function AcessoIndevidos() {
  const { usuarios } = useUsuarios();
  const { apontamento } = useApontamento();
  const { handleApontamento, handleApontamentoMultiple } = useApontamentoActions();

  const isLastWeek = (data: string): boolean => {
    const dataAcesso = new Date(data);
    const hoje = new Date();
    const umaSemanaAtras = new Date(hoje);

    hoje.setHours(0, 0, 0, 0);
    umaSemanaAtras.setDate(hoje.getDate() - 7);

    return dataAcesso >= umaSemanaAtras && dataAcesso < hoje;
  };

  const filteredApontamentos = apontamento.filter((ap: Apontamento) => (String(ap.apontamento) === "2" || Number(ap.apontamento) === 2) && isLastWeek(ap.data_acesso))
    .sort((a: Apontamento, b: Apontamento) => new Date(b.data_acesso).getTime() - new Date(a.data_acesso).getTime());

  const handleLimparTodos = () => {
    const ids = filteredApontamentos.map((ap: Apontamento) => ap.id);
    handleApontamentoMultiple(ids);
  };

  return (
    <div className="col-md-6 pb-4">
      <div className="card">
        <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0" style={{ height: "400px" }}>
          <div className="card-header bg-white border-bottom px-4 py-3">
            <div className="d-flex align-items-center justify-content-between gap-3">

              <div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-circle text-primary me-2"></i>
                    <h5 className="mb-0 fw-semibold text-dark">Uso Inconsistente do Cartão</h5>
                      <i className="fas fa-info-circle text-secondary ms-2 mr-0 ml-2" style={{fontSize: "14px", cursor: "pointer"}}
                          title="Os dados do dia de hoje aparecerão amanhã.">    
                      </i>
                </div>
                <small className="text-secondary">
                    Ocorrências registradas na última semana
                </small>
              </div>

              <button onClick={handleLimparTodos} className="btn btn-outline-danger d-flex justify-content-center align-items-center flex-shrink-0"
                style={{width: "36px", height: "36px", padding: 0}} title="Limpar todos os registros" disabled={filteredApontamentos.length === 0}>
                <i className="fas fa-trash mr-0"></i>
              </button>

            </div>
          </div>

          <div className="card-body p-0 overflow-auto m-0" style={{ maxHeight: "340px" }}>
            <table className="table table-hover mb-0">
              <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
                <tr>
                  <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">
                    Data
                  </th>
                  <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold text-center" style={{ width: "70px" }}>
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredApontamentos.map((ap: Apontamento) => {
                  const usuario = usuarios.find((u: Usuario) => u.matricula === ap.usuario_id);
                  const data = new Date(ap.data_acesso);

                  return (
                    <tr key={ap.id}>
                      <td className="px-4 py-3 align-middle">
                        <span className="fw-semibold text-dark">{usuario ? usuario.nome_usuario : "Não encontrado"}</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-nowrap">
                        <div className="d-flex flex-column">
                          <span className="text-dark">{data.toLocaleDateString("pt-BR")}</span>
                          <small className="text-secondary">
                            {data.toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit", second: "2-digit"})}
                          </small>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {ap.ent_sai === "1" ? (
                          <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-0">
                            <i className="fas fa-sign-in-alt me-1"></i>
                            Usuário entrou e não saiu
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-2">
                              <i className="fas fa-sign-out-alt me-1"></i>
                              Usuário saiu e não entrou
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle text-center">
                        <button onClick={() => handleApontamento(ap.id)} className="btn btn-outline-danger d-inline-flex justify-content-center align-items-center"
                          style={{width: "36px", height: "36px", padding: 0}} title="Excluir registro">
                          <i className="fas fa-trash mr-0"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-light border-0 px-4 py-3">
            <span className="text-secondary small">
              <i className="fas fa-history me-2"></i>
              {filteredApontamentos.length}{" "}
              {filteredApontamentos.length === 1 ? "ocorrência registrada" : "ocorrências registradas"}{" "}
              na última semana
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
