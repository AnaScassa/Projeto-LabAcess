import { useEffect, useState } from "react";
import { carregarCruzamentos, type Cruzamento } from "../../services/cruzamento";

export default function Cruzamentos() {
  const [cruzamentos, setCruzamentos] = useState<Cruzamento[]>([]);

  useEffect(() => {
      let ativo = true;
      carregarCruzamentos().then((dados) => { if (ativo) setCruzamentos(dados); }).catch((error) => console.error("Erro ao carregar cruzamentos:", error));
      return () => { ativo = false; };
  }, []);

    return (
        <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0" style={{ height: "400px" }}>
            <div className="card-header bg-white border-bottom px-4 py-3">
                <div>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-unlink text-primary me-2"></i>
                        <h5 className="mb-0 fw-semibold text-dark">Acessos sem Registro</h5>
                    </div>
                    <small className="text-secondary">Acessos identificados sem registro no agendamento</small>
                </div>
            </div>

            <div className="card-body p-0 overflow-auto m-0" style={{ maxHeight: "340px" }}>
                <table className="table table-hover mb-0">
                    <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
                        <tr>
                            <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold border-bottom">Usuário</th>
                            <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold border-bottom">Data</th>
                            <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold border-bottom">Porta</th>
                        </tr>
                    </thead>

                    <tbody>
                        {cruzamentos.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-4 text-center text-secondary">
                                    <i className="fas fa-check-circle me-2"></i>
                                    Nenhum acesso sem registro.
                                </td>
                            </tr>
                        ) : (
                            cruzamentos.map((cruzamento) => {
                                const data = new Date(cruzamento.data_acesso);

                                return (
                                    <tr key={cruzamento.id}>
                                        <td className="px-4 py-3 align-middle border-bottom">
                                            <span className="fw-semibold text-dark">{cruzamento.usuario}</span>
                                        </td>

                                        <td className="px-4 py-3 align-middle text-nowrap border-bottom">
                                            <div className="d-flex flex-column">
                                                <span className="text-dark">{data.toLocaleDateString("pt-BR")}</span>
                                                <small className="text-secondary">
                                                    {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                                </small>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 align-middle border-bottom">
                                            <span className="text-secondary">{cruzamento.porta}</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card-footer bg-light border-0 px-4 py-3">
                <span className="text-secondary small">
                    <i className="fas fa-history me-2"></i>
                    {cruzamentos.length} {cruzamentos.length === 1 ? "acesso sem registro" : "acessos sem registro"}
                </span>
            </div>
        </div>
    );
}