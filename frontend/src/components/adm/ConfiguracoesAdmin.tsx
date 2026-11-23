import { useEffect, useState, type FormEvent } from "react";
import { buscarStatusRpa, type StatusRpa } from "../../services/statusRpa";
import { buscarStatusWindows, type StatusWindows } from "../../services/statusWindows";
import { atualizarPermissaoSuperusuario, buscarUsuariosPrivilegiados } from "../../services/users";
import type { UsuarioPrivilegiado } from "../../types/Users";

const INTERVALO_STATUS_MS = 15_000;

function nomeCompleto(usuario: UsuarioPrivilegiado) {
  return `${usuario.first_name} ${usuario.last_name}`.trim() || usuario.username;
}

export default function ConfiguracoesAdmin() {
  const [statusRpa, setStatusRpa] = useState<StatusRpa | null>(null);
  const [erroRpa, setErroRpa] = useState<string | null>(null);
  const [statusWindows, setStatusWindows] = useState<StatusWindows | null>(null);
  const [erroWindows, setErroWindows] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioPrivilegiado[]>([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(true);
  const [erroUsuarios, setErroUsuarios] = useState<string | null>(null);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioPrivilegiado | null>(null);
  const [superusuarioEditado, setSuperusuarioEditado] = useState(false);
  const [salvandoPermissao, setSalvandoPermissao] = useState(false);
  const [erroPermissao, setErroPermissao] = useState<string | null>(null);
  const podeEditarPermissoes = localStorage.getItem("is_superuser") === "true";

  useEffect(() => {
    let ativo = true;

    const atualizarStatusRpa = async () => {
      try {
        const status = await buscarStatusRpa();
        if (ativo) {
          setStatusRpa(status);
          setErroRpa(null);
        }
      } catch (error) {
        console.error("Erro ao buscar status do RPA:", error);
        if (ativo) setErroRpa("Não foi possível consultar o status do RPA.");
      }
    };

    void atualizarStatusRpa();
    const intervalo = window.setInterval(() => void atualizarStatusRpa(), INTERVALO_STATUS_MS);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    const atualizarStatusWindows = async () => {
      try {
        const status = await buscarStatusWindows();
        if (ativo) {
          setStatusWindows(status);
          setErroWindows(null);
        }
      } catch (error) {
        console.error("Erro ao buscar status do Windows:", error);
        if (ativo) setErroWindows("Não foi possível consultar o status do Windows.");
      }
    };

    void atualizarStatusWindows();
    const intervalo = window.setInterval(() => void atualizarStatusWindows(), INTERVALO_STATUS_MS);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarUsuarios() {
      try {
        const dados = await buscarUsuariosPrivilegiados();
        if (ativo) setUsuarios(dados);
      } catch (error) {
        console.error("Erro ao carregar usuários com permissões administrativas:", error);
        if (ativo) setErroUsuarios("Não foi possível carregar os usuários privilegiados.");
      } finally {
        if (ativo) setCarregandoUsuarios(false);
      }
    }

    void carregarUsuarios();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!usuarioEditando || salvandoPermissao) return;

    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUsuarioEditando(null);
    };

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [usuarioEditando, salvandoPermissao]);

  const abrirEdicaoPermissao = (usuario: UsuarioPrivilegiado) => {
    setUsuarioEditando(usuario);
    setSuperusuarioEditado(usuario.is_superuser);
    setErroPermissao(null);
  };

  const salvarPermissao = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!usuarioEditando) return;

    setSalvandoPermissao(true);
    setErroPermissao(null);
    try {
      const atualizado = await atualizarPermissaoSuperusuario(usuarioEditando.id, superusuarioEditado);
      setUsuarios((atuais) => {
        const aindaPrivilegiado = atualizado.is_staff || atualizado.is_superuser;
        if (!aindaPrivilegiado) {
          return atuais.filter((usuario) => usuario.id !== atualizado.id);
        }
        return atuais.map((usuario) => usuario.id === atualizado.id ? atualizado : usuario);
      });
      setUsuarioEditando(null);
    } catch (error) {
      console.error("Erro ao atualizar permissão de superusuário:", error);
      setErroPermissao(error instanceof Error ? error.message : "Não foi possível salvar a permissão.");
    } finally {
      setSalvandoPermissao(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h5 className="font-weight-bold text-dark mb-1">Configurações do sistema</h5>
        <p className="text-muted mb-0">Acompanhe os serviços e as permissões administrativas.</p>
      </div>

      <div className="row mb-2">
        <div className="col-12 col-md-6 mb-4">
          <section className="card border-0 rounded-lg shadow-sm h-100">
            <header className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center">
              <i className="fas fa-robot text-success mr-2" aria-hidden="true"></i>
              <h6 className="font-weight-bold text-dark mb-0">Status do RPA</h6>
            </header>
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
                {erroRpa ? (
                  <span className="badge badge-danger badge-pill p-2" role="alert">{erroRpa}</span>
                ) : statusRpa === null ? (
                  <span className="text-secondary d-flex align-items-center" role="status">
                    <span className="spinner-border spinner-border-sm text-success mr-2" aria-hidden="true"></span>
                    Consultando...
                  </span>
                ) : (
                  <span className={`badge badge-pill p-2 ${statusRpa.online ? "badge-success" : "badge-danger"}`} aria-live="polite">
                    <i className="fas fa-circle mr-2" aria-hidden="true"></i>
                    {statusRpa.online ? "Online" : "Offline"}
                  </span>
                )}
                <button type="button" className="btn btn-outline-success btn-sm mt-2 mt-sm-0" disabled
                  title="Ação ilustrativa, ainda sem integração"
                >
                  <i className="fas fa-redo-alt mr-2" aria-hidden="true"></i>
                  Reiniciar RPA
                </button>
              </div>
              {statusRpa && !erroRpa && (
                <>
                  <div className="border rounded p-3 bg-light d-flex flex-column">
                    <small className="text-muted mb-1">Último sinal recebido</small>
                    <strong className="text-dark">
                      {statusRpa.ultimo_sinal
                        ? new Date(statusRpa.ultimo_sinal).toLocaleString("pt-BR")
                        : "Nenhum sinal recebido"}
                    </strong>
                  </div>
                  <small className="text-muted mt-3">
                    <i className="fas fa-sync-alt mr-1" aria-hidden="true"></i>
                    Atualizado a cada 15 segundos
                  </small>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="col-12 col-md-6 mb-4">
          <section className="card border-0 rounded-lg shadow-sm h-100">
            <header className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center">
              <i className="fab fa-windows text-primary mr-2" aria-hidden="true"></i>
              <h6 className="font-weight-bold text-dark mb-0">Status do Windows</h6>
            </header>
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
                {erroWindows ? (
                  <span className="badge badge-danger badge-pill p-2" role="alert">{erroWindows}</span>
                ) : statusWindows === null ? (
                  <span className="text-secondary d-flex align-items-center" role="status">
                    <span className="spinner-border spinner-border-sm text-primary mr-2" aria-hidden="true"></span>
                    Consultando...
                  </span>
                ) : (
                  <span className={`badge badge-pill p-2 ${statusWindows.status.toLowerCase() === "active" ? "badge-success" : "badge-danger"}`} aria-live="polite">
                    <i className="fas fa-circle mr-2" aria-hidden="true"></i>
                    {statusWindows.status.toLowerCase() === "active" ? "Online" : "Offline"}
                  </span>
                )}
                <button type="button" className="btn btn-outline-primary btn-sm mt-2 mt-sm-0" disabled title="Ação ilustrativa, ainda sem integração">
                  <i className="fas fa-redo-alt mr-2" aria-hidden="true"></i>
                  Reiniciar Windows
                </button>
              </div>
              {statusWindows && !erroWindows && (
                <>
                  <div className="border rounded p-3 bg-light d-flex flex-column">
                    <small className="text-muted mb-1">
                      Agente {statusWindows.agent_id}{statusWindows.name ? ` · ${statusWindows.name}` : ""}
                    </small>
                    <strong className="text-dark">{statusWindows.os || "Sistema operacional não informado"}</strong>
                    <small className="text-muted mt-3 mb-1">Último contato</small>
                    <strong className="text-dark">
                      {statusWindows.last_keepalive
                        ? new Date(statusWindows.last_keepalive).toLocaleString("pt-BR")
                        : "Sem contato registrado"}
                    </strong>
                  </div>
                  <small className="text-muted mt-3">
                    <i className="fas fa-sync-alt mr-1" aria-hidden="true"></i>
                    Atualizado a cada 15 segundos
                  </small>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-4">
          <section className="card border-0 border-top border-primary rounded-lg shadow-sm" style={{ height: "360px" }}>
            <div className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center flex-shrink-0 w-100">
              <div className="d-flex align-items-center">
                <i className="fas fa-user-shield text-primary mr-2"></i>
                <h6 className="font-weight-bold text-dark mb-0">Acessos administrativos</h6>
              </div>
              {!carregandoUsuarios && !erroUsuarios && (
                <span className="badge badge-primary ml-auto flex-shrink-0">{usuarios.length} usuário(s)</span>
              )}
            </div>
            <div className="card-body p-0 overflow-auto" style={{ minHeight: 0 }}>
              {erroUsuarios ? (
                <div className="alert alert-danger m-4" role="alert">{erroUsuarios}</div>
              ) : carregandoUsuarios ? (
                <div className="p-4 text-secondary d-flex h-100 align-items-center justify-content-center">
                  <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                  Carregando usuários...
                </div>
              ) : usuarios.length === 0 ? (
                <div className="p-4 text-secondary">Nenhum usuário com permissão administrativa encontrado.</div>
              ) : (
                <div className="table-responsive h-100">
                  <table className="table table-hover mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Usuário</th>
                        <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">E-mail</th>
                        <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Permissões</th>
                        {podeEditarPermissoes && (
                          <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Ações</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td className="px-4 py-3 align-middle">
                            <span className="d-block font-weight-bold text-dark">{nomeCompleto(usuario)}</span>
                            <small className="text-secondary">@{usuario.username} · ID {usuario.id}</small>
                          </td>
                          <td className="px-4 py-3 align-middle">{usuario.email || "Sem e-mail"}</td>
                          <td className="px-4 py-3 align-middle">
                            <div className="d-flex flex-wrap" style={{gap: "5px"}}>
                              {usuario.is_superuser && <span className="badge badge-danger">Superusuário</span>}
                              {usuario.is_staff && <span className="badge badge-primary">ADM</span>}
                            </div>
                          </td>
                          {podeEditarPermissoes && (
                            <td className="px-4 py-3 align-middle">
                              <button type="button" className="btn btn-outline-secondary btn-sm" aria-label={`Editar permissão de ${nomeCompleto(usuario)}`}
                                title="Editar permissão de superusuário" onClick={() => abrirEdicaoPermissao(usuario)}
                              >
                                <i className="fas fa-edit mr-0"></i>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {usuarioEditando && (
        <div className="position-fixed d-flex align-items-center justify-content-center p-3" 
          style={{ inset: 0, zIndex: 1050, backgroundColor: "rgba(0, 0, 0, 0.5)" }} onClick={() => !salvandoPermissao && setUsuarioEditando(null)}
        >
          <section className="card border-0 rounded-lg shadow-lg w-100 mb-0" role="dialog" aria-modal="true"
            aria-labelledby="editar-permissao-titulo" style={{ maxWidth: "560px" }} onClick={(event) => event.stopPropagation()}
          >
            <header className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center">
              <div className="d-flex flex-column align-items-start flex-grow-1">
                <h5 id="editar-permissao-titulo" className="font-weight-bold text-dark mb-1">Editar permissão</h5>
                <small className="text-secondary">{nomeCompleto(usuarioEditando)} · @{usuarioEditando.username}</small>
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm ml-auto" aria-label="Fechar"
                disabled={salvandoPermissao} onClick={() => setUsuarioEditando(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </header>

            <form onSubmit={salvarPermissao}>
              <div className="card-body p-4">
                {erroPermissao && <div className="alert alert-danger" role="alert">{erroPermissao}</div>}
                <div className="border rounded p-3 bg-light">
                  <div className="custom-control custom-switch">
                    <input id="permissao-superusuario" type="checkbox" className="custom-control-input" checked={superusuarioEditado}
                      onChange={(event) => setSuperusuarioEditado(event.target.checked)} disabled={salvandoPermissao}
                    />
                    <label className="custom-control-label font-weight-bold text-dark" htmlFor="permissao-superusuario">
                      Superusuário
                    </label>
                  </div>
                  <small className="d-block text-secondary mt-2">Permite acesso e controle total das funções administrativas do sistema.</small>
                </div>
                <div className="mt-3">
                  <span className="text-secondary small">Permissão atual de equipe: </span>
                  <span className="badge badge-primary">{usuarioEditando.is_staff ? "ADM" : "Não"}</span>
                </div>
              </div>
              <footer className="card-footer bg-white d-flex justify-content-end gap-2 px-4 py-3">
                <button type="button" className="btn btn-outline-secondary" disabled={salvandoPermissao} onClick={() => setUsuarioEditando(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={salvandoPermissao}>
                  {salvandoPermissao ? "Salvando..." : "Salvar"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
