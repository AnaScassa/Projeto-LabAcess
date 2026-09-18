import { useUsuarios } from "../../hooks/useUsuarios";
import type { Usuario } from "../../types/Usuario";

export default function UltimosAcessos() {
    const { usuarios } = useUsuarios();
    const dataAtual = Date.now();

    const acessos24Horas = usuarios.flatMap((usuario: Usuario) => {
        return (usuario.acessos || []).filter((acesso) => {
            const dataAcesso = new Date(acesso.data_acesso).getTime();
            const diffHoras = (dataAtual - dataAcesso) / (1000 * 60 * 60);
            return diffHoras <= 24;

        }).map((acesso) => ({
            usuario: usuario.nome_usuario,
            data_acesso: acesso.data_acesso,
            ent_sai: acesso.ent_sai,
            desc_area: acesso.desc_area,
        }));
    });

    const acessosOrdenados = acessos24Horas.sort((a, b) => {
        return (new Date(b.data_acesso).getTime() - new Date(a.data_acesso).getTime());
    });

    return (
        <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">

            <div className="card-header bg-white border-bottom px-4 py-3">
                <div>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-clock text-primary me-2"></i>

                        <h5 className="mb-0 fw-semibold text-dark">
                            Últimos Acessos
                        </h5>
                    </div>

                    <small className="text-secondary">
                        Acessos realizados nas últimas 24 horas
                    </small>
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
                            <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold text-center">
                                Tipo
                            </th>
                            <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">
                                Porta
                            </th>
                        </tr>
                    </thead>


                    <tbody>
                        {acessosOrdenados.map((acesso, index) => {
                            const entrada = acesso.ent_sai === "1";
                            const data = new Date(acesso.data_acesso);
                            return (

                                <tr key={index}>
                                    <td className="px-4 py-3 align-middle">
                                        <span className="fw-semibold text-dark">
                                            {acesso.usuario}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 align-middle text-nowrap">
                                        <div className="d-flex flex-column">
                                            <span className="text-dark">
                                                {data.toLocaleDateString("pt-BR")}
                                            </span>
                                            <small className="text-secondary">
                                                {data.toLocaleTimeString("pt-BR", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                })}
                                            </small>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 align-middle text-center">
                                        {entrada ? (
                                            <span className="badge bg-success-subtle text-success-emphasis rounded-pill px-3 py-2">
                                                <i className="fas fa-sign-in-alt me-1"></i>
                                                Entrada
                                            </span>
                                        ) : (
                                            <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-2">
                                                <i className="fas fa-sign-out-alt me-1"></i>
                                                Saída
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 align-middle">
                                        <span className="text-secondary">
                                            {acesso.desc_area}
                                        </span>
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
                    {acessosOrdenados.length} acessos nas últimas 24 horas
                </span>
            </div>
        </div>
    );
}