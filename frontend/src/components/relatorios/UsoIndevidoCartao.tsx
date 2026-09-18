import { useApontamento } from "../../hooks/useApontamento";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useApontamentoActions } from "../../hooks/useDesativamento";
import type { Apontamento } from "../../types/Apontamento";
import type { Usuario } from "../../types/Usuario";

export default function UsoIndevidoCartao() {
  const { usuarios } = useUsuarios();
  const { apontamento } = useApontamento();
  const { handleApontamento, handleApontamentoMultiple } = useApontamentoActions();

  const filteredApontamentos = apontamento.filter((ap: Apontamento) => {
    const isApontamento = String(ap.apontamento) === "1" || Number(ap.apontamento) === 1;
    const dataAcesso = new Date(ap.data_acesso);
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

      return isApontamento && dataAcesso >= trintaDiasAtras;
  }).sort((a, b) => new Date(b.data_acesso).getTime() - new Date(a.data_acesso).getTime());

  const handleLimparTodos = () => {
    const ids = filteredApontamentos.map((ap: Apontamento) => ap.id);
    handleApontamentoMultiple(ids);
  };

  return (
    <div className="col-md-6 pb-4">
      <div className="card mb-0">
        <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0" style={{ height: "400px" }}>

          <div className="card-header bg-white border-bottom px-4 py-3">
            <div className="d-flex align-items-center justify-content-between gap-3">

              <div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                  <h5 className="mb-0 fw-semibold text-dark">Uso Indevido do Cartão</h5>
                </div>
                <small className="text-secondary">Ocorrências registradas nos últimos 30 dias</small>
              </div>

              <button onClick={handleLimparTodos} className="btn btn-outline-danger d-flex justify-content-center align-items-center flex-shrink-0"
                  style={{width: "36px", height: "36px", padding: 0}} title="Limpar todos os registros" disabled={filteredApontamentos.length === 0}>
                <i className="fas fa-trash m-0"></i>
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
                        <span className="fw-semibold text-dark">
                          {usuario ? usuario.nome_usuario : "Não encontrado"}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle text-nowrap">
                          <div className="d-flex flex-column">
                              <span className="text-dark">{data.toLocaleDateString("pt-BR")}</span>
                              <small className="text-secondary">
                                  {data.toLocaleTimeString("pt-BR",{hour: "2-digit", minute: "2-digit", second: "2-digit"})}
                              </small>
                            </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                          <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill px-0 py-2">
                              <i className="fas fa-exclamation-circle me-1"></i>
                              {ap.desc_evento}
                          </span>
                      </td>

                      <td className="px-4 py-3 align-middle text-center">
                          <button onClick={() => handleApontamento(ap.id)} className="btn btn-outline-danger d-inline-flex justify-content-center align-items-center"
                              style={{width: "36px", height: "36px", padding: 0}} title="Excluir registro">
                              <i className="fas fa-trash m-0"></i>
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
              nos últimos 30 dias
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}