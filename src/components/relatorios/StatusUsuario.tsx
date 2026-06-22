import { useEffect, useState } from "react";
import { carregarUsuarios } from "../../services/usuarios";
import { getUsuariosAtivos } from "../../services/usuariosAtivos";
import type { Usuario } from "../../types/Usuario";

type UsuarioAtivo = {
  usuario_id: string;
  desc_area: string;
  ent_sai: string;
  data_acesso: string;
}

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

        setUsuariosCCS(usuariosComNome.filter((u) => u.ent_sai === "1" && u.desc_area?.toUpperCase() === "CCS"));
        setUsuariosLab(usuariosComNome.filter((u) => u.ent_sai === "1" && (u.desc_area?.toUpperCase() === "LAB" || u.desc_area?.toUpperCase() === "CCS_LAB")));

      } catch (error) {
        console.error(error);
      }
    }

    carregar();
  }, []);

  return (
   <div className="row">
    <div className="col-md-6">
      <div className="card card-primary card-outline">
        <div className="card-header">
          <h3 className="card-title" style={{ fontWeight: 500 }}>
            <i className="fas fa-building mr-2"></i>
            Usuários Ativos no CCS
          </h3>
        </div>

        <div className="card-body p-0" style={{ height: "350px", overflowY: "auto"}}>
          <table className="table table-hover table-striped mb-0">
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>Usuário</th>
                <th>Última Entrada</th>
              </tr>
            </thead>

            <tbody>
              {usuariosCCS.map((usuario) => (
                <tr key={usuario.usuario_id}>
                  <td>
                    <strong>{usuario.nome_usuario}</strong>
                  </td>

                  <td>
                    {new Date(usuario.data_acesso).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer text-muted">
          Total: {usuariosCCS.length}
        </div>
      </div>
    </div>

    <div className="col-md-6">
      <div className="card card-success card-outline">
        <div className="card-header">
          <h3 className="card-title" style={{ fontWeight: 500 }}>
            <i className="fas fa-flask mr-2"></i>
            Usuários Ativos no Laboratório
          </h3>
        </div>

        <div className="card-body p-0" style={{ height: "350px", overflowY: "auto" }}>
          <table className="table table-hover table-striped mb-0">
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>Usuário</th>
                <th>Última Entrada</th>
              </tr>
            </thead>

            <tbody>
              {usuariosLab.map((usuario) => (
                <tr key={usuario.usuario_id}>
                  <td>
                    <strong>{usuario.nome_usuario}</strong>
                  </td>

                  <td>
                    {new Date(usuario.data_acesso).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer text-muted">
          Total: {usuariosLab.length}
        </div>
      </div>
    </div>
  </div>
    );
}