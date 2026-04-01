import { useUsuarios } from "../../hooks/useUsuarios";
import type { Usuario } from "../../types/Usuario";

export default function UltimosAcessos() {
    const { usuarios } = useUsuarios();
    const dataAtual = Date.now();

    const acessosRecentes = usuarios.flatMap((usuario: Usuario) => {
        return (usuario.acessos || [])
            .filter((acesso) => {
                const dataAcesso = new Date(acesso.data_acesso).getTime();
                const diffHoras = (dataAtual - dataAcesso) / (1000 * 60 * 60);
                return diffHoras <= 24;
            })
            .map((acesso) => ({
                usuario: usuario.nome_usuario,
                data_acesso: acesso.data_acesso,
                ent_sai: acesso.ent_sai,
            }));
    });

    const acessosOrdenados = acessosRecentes.sort((a, b) => {
        return new Date(b.data_acesso).getTime() - new Date(a.data_acesso).getTime();
    });

    return (
        <div className="card-body p-0" style={{ maxHeight: "340px", overflowY: "auto" }}>
            <table className="table table-striped mb-0">
                <thead className="table-light" style={{ position: "sticky", top: 0 }}>
                    <tr>
                        <th>Usuário</th>
                        <th>Data de Acesso</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    {acessosOrdenados.map((acesso, index) => {
                        return (
                            <tr key={index}>
                                <td>{acesso.usuario}</td>
                                <td>{new Date(acesso.data_acesso).toLocaleString()}</td>
                                <td>
                                    {acesso.ent_sai === "1" ? "Entrada" : "Saída"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}