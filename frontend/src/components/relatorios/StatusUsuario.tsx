import { useEffect, useState } from "react";
import { carregarUsuarios } from "../../services/usuarios";
import { getUsuariosAtivos } from "../../services/usuariosAtivos";
import type { Usuario } from "../../types/Usuario";

type UsuarioAtivo = {
  usuario_id: string;
  desc_area: string;
  ent_sai: string;
  data_acesso: string;
};

type UsuarioComNome = UsuarioAtivo & {
  nome_usuario: string;
};

export default function StatusAluno() {
  const [usuariosCCS, setUsuariosCCS] = useState<UsuarioComNome[]>([]);
  const [usuariosLab, setUsuariosLab] = useState<UsuarioComNome[]>([]);

  useEffect(() => {
    async function carregar() {
      try {
        const usuarios: Usuario[] = await carregarUsuarios();
        const ativos: UsuarioAtivo[] = await getUsuariosAtivos();

        const usuariosComNome: UsuarioComNome[] = ativos.map((ativo) => {
          const usuario = usuarios.find(
            (u) => String(u.matricula) === String(ativo.usuario_id)
          );

          return {
            ...ativo,
            nome_usuario: usuario?.nome_usuario ?? "Não encontrado",
          };
        });

        const ordenarPorData = (lista: UsuarioComNome[]) => [...lista].sort((a, b) => new Date(b.data_acesso).getTime() - new Date(a.data_acesso).getTime());

        setUsuariosCCS(ordenarPorData(usuariosComNome.filter((u) => u.ent_sai === "1" && u.desc_area?.toUpperCase() === "CCS")));
        setUsuariosLab(ordenarPorData(usuariosComNome.filter((u) => u.ent_sai === "1" && (u.desc_area?.toUpperCase() === "LAB" || u.desc_area?.toUpperCase() === "CCS_LAB"))));

      } catch (error) {
        console.error(error);
      }
    }

    carregar();
  }, []);

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-6 pb-4">
        <div className="card h-100 shadow-sm border-0 border-top border-primary rounded-3 overflow-hidden">

          <div className="card-header bg-white border-bottom px-4 py-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-building text-primary"></i>
                <h5 className="mb-0 fw-semibold text-dark">Usuários Ativos no CCS</h5>
              </div>

            </div>
          </div>


          <div className="card-body p-0 overflow-auto" style={{ height: "350px" }}>
            <table className="table table-hover mb-0">
              <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
                <tr>
                  <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold text-end">
                    Última Entrada
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuariosCCS.map((usuario) => (
                  <tr key={usuario.usuario_id}>
                    <td className="px-4 py-3 align-middle">
                      <span className="fw-semibold text-dark">
                        {usuario.nome_usuario}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-end text-secondary text-nowrap">
                      {new Date(usuario.data_acesso).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit", second: "2-digit"})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div className="card-footer bg-light border-0 px-4 py-3">
            <span className="text-secondary small">
              <i className="fas fa-users me-2"></i>
              {usuariosCCS.length} usuários ativos
            </span>
          </div>

        </div>
      </div>

      <div className="col-12 col-lg-6 pb-4">
        <div className="card h-100 shadow-sm border-0 border-top border-success rounded-3 overflow-hidden">

          <div className="card-header bg-white border-bottom px-4 py-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-flask text-success"></i>
                <h5 className="mb-0 fw-semibold text-dark">Usuários Ativos no Laboratório</h5>
              </div>
            </div>
          </div>

          <div className="card-body p-0 overflow-auto" style={{ height: "350px" }}>
            <table className="table table-hover mb-0">
              <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
                <tr>
                  <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold text-end">
                    Última Entrada
                  </th>
                </tr>
              </thead>

              <tbody>
                {usuariosLab.map((usuario) => (
                  <tr key={usuario.usuario_id}>
                    <td className="px-4 py-3 align-middle">
                      <span className="fw-semibold text-dark">
                        {usuario.nome_usuario}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-end text-secondary text-nowrap">
                      {new Date(usuario.data_acesso).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit", second: "2-digit"})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div className="card-footer bg-light border-0 px-4 py-3">
            <span className="text-secondary small">
              <i className="fas fa-users me-2"></i>
              {usuariosLab.length} usuários ativos
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}