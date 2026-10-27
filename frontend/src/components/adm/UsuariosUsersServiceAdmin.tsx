import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import TableBody from "../style/TableBody";
import { atualizarUsuarioUsersService, buscarUsers, type DadosEdicaoUsuario } from "../../services/users";
import type { Users } from "../../types/Users";

const usuariosPorPagina = 15;

function getVisiblePages(current: number, total: number): (number | string)[] {
  if (total <= 6) return Array.from({ length: total }, (_, index) => index);

  const pages: (number | string)[] = [0];
  if (current > 3) pages.push("...");

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  for (let index = start; index <= end; index++) pages.push(index);

  if (current < total - 4) pages.push("...");
  pages.push(total - 1);
  return pages;
}

export default function UsuariosUsersServiceAdmin() {
  const [usuarios, setUsuarios] = useState<Users[]>([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [usuarioEditando, setUsuarioEditando] = useState<Users | null>(null);
  const [formulario, setFormulario] = useState<DadosEdicaoUsuario>({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    is_superuser: false,
  });
  const [salvando, setSalvando] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);
  const podeEditarUsuarios = localStorage.getItem("is_superuser") === "true";

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setUsuarios(await buscarUsers());
    } catch (error) {
      console.error("Erro ao carregar usuários do users_service:", error);
      setErro("Não foi possível carregar os usuários do Users_Service.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarUsuarios();
  }, [carregarUsuarios]);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase();
    if (!termo) return usuarios;

    return usuarios.filter((usuario) =>
      [usuario.full_name, usuario.first_name, usuario.last_name, usuario.username, usuario.email]
        .filter(Boolean)
        .some((valor) => valor?.toLocaleLowerCase().includes(termo)),
    );
  }, [usuarios, busca]);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const usuariosVisiveis = usuariosFiltrados.slice(
    pagina * usuariosPorPagina,
    (pagina + 1) * usuariosPorPagina,
  );
  const paginasVisiveis = getVisiblePages(pagina, totalPaginas);

  useEffect(() => {
    setPagina(0);
  }, [busca]);

  useEffect(() => {
    if (totalPaginas > 0 && pagina >= totalPaginas) setPagina(totalPaginas - 1);
  }, [pagina, totalPaginas]);

  useEffect(() => {
    if (!usuarioEditando || salvando) return;

    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUsuarioEditando(null);
    };
    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [usuarioEditando, salvando]);

  const abrirEdicao = (usuario: Users) => {
    setUsuarioEditando(usuario);
    setFormulario({
      username: usuario.username,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      email: usuario.email ?? "",
      is_superuser: usuario.is_superuser,
    });
    setErroEdicao(null);
  };

  const salvarEdicao = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!usuarioEditando) return;

    setSalvando(true);
    setErroEdicao(null);
    try {
      const atualizado = await atualizarUsuarioUsersService(usuarioEditando.id, formulario);
      setUsuarios((atuais) => atuais.map((usuario) => (
        usuario.id === atualizado.id ? atualizado : usuario
      )));
      setUsuarioEditando(null);
    } catch (error) {
      console.error("Erro ao atualizar usuário do users_service:", error);
      setErroEdicao(error instanceof Error ? error.message : "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3" style={{ gap: "12px" }}>
        <div>
          <h5 className="font-weight-bold text-dark mb-1">Usuarios Users_Service</h5>
          <small className="text-muted">{usuariosFiltrados.length} usuário(s)</small>
        </div>
        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          <div className="form-group mb-0" style={{ width: "100%", maxWidth: "320px" }}>
            <label htmlFor="busca-usuarios-smartcard" className="form-label mb-1 fw-semibold text-secondary">Buscar nome:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="fas fa-search"></i></span>
              </div>
              <input id="busca-usuarios-smartcard" type="search" className="form-control" placeholder="Digite nome ou matrícula"
                value={busca} onChange={(event) => setBusca(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {erro && <div className="alert alert-danger" role="alert">{erro}</div>}

      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">ID</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Nome</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Usuário</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">E-mail</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Permissão</th>
              {podeEditarUsuarios && (
                <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Ações</th>
              )}
            </tr>
          </thead>
          <TableBody
            data={usuariosVisiveis}
            colSpan={podeEditarUsuarios ? 6 : 5}
            loading={carregando}
            emptyMessage={erro ? "Não foi possível carregar os usuários." : "Nenhum usuário encontrado."}
            renderRow={(usuario) => (
              <tr key={usuario.id}>
                <td className="px-4 py-3 align-middle">{usuario.id}</td>
                <td className="px-4 py-3 align-middle">
                  {usuario.full_name?.trim() || `${usuario.first_name} ${usuario.last_name}`.trim() || "Sem nome"}
                </td>
                <td className="px-4 py-3 align-middle">{usuario.username}</td>
                <td className="px-4 py-3 align-middle">{usuario.email || "Sem e-mail"}</td>
                <td className="px-4 py-3 align-middle">
                  {usuario.is_superuser
                    ? <span className="badge badge-danger">Superusuário</span>
                    : <span className="text-muted">Padrão</span>}
                </td>
                {podeEditarUsuarios && (
                  <td className="px-4 py-3 align-middle">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      aria-label={`Editar usuário ${usuario.username}`}
                      title="Editar usuário"
                      onClick={() => abrirEdicao(usuario)}
                    >
                      <i className="fas fa-edit" aria-hidden="true"></i>
                    </button>
                  </td>
                )}
              </tr>
            )}
          />
        </table>
      </div>

      {!carregando && usuariosFiltrados.length > 0 && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 py-3 border-top">
          <div className="text-secondary small">
            Mostrando {pagina * usuariosPorPagina + 1} a{" "}
            {Math.min((pagina + 1) * usuariosPorPagina, usuariosFiltrados.length)} de{" "}
            {usuariosFiltrados.length} registros
          </div>

          <div className="d-flex justify-content-end" style={{ maxWidth: "100%", overflowX: "auto" }}>
            <div className="dataTables_paginate paging_simple_numbers">
              <ul className="pagination mb-0 flex-wrap">
                <li className={`paginate_button page-item ${pagina === 0 ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPagina((atual) => Math.max(0, atual - 1))}
                    disabled={pagina === 0}
                  >
                    Anterior
                  </button>
                </li>

                {paginasVisiveis.map((item, index) => item === "..." ? (
                  <li key={`ellipsis-${index}`} className="paginate_button page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                ) : (
                  <li key={item} className={`paginate_button page-item ${pagina === item ? "active" : ""}`}>
                    <button type="button" className="page-link" onClick={() => setPagina(Number(item))}>
                      {Number(item) + 1}
                    </button>
                  </li>
                ))}

                <li className={`paginate_button page-item ${pagina >= totalPaginas - 1 ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPagina((atual) => Math.min(totalPaginas - 1, atual + 1))}
                    disabled={pagina >= totalPaginas - 1}
                  >
                    Próximo
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {usuarioEditando && (
        <div
          className="position-fixed d-flex align-items-center justify-content-center p-3"
          style={{ inset: 0, zIndex: 1050, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => !salvando && setUsuarioEditando(null)}
        >
          <section
            className="card border-0 rounded-lg shadow-lg w-100 mb-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editar-usuario-users-service-titulo"
            style={{ maxWidth: "560px" }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center">
              <div className="flex-grow-1">
                <h5 id="editar-usuario-users-service-titulo" className="font-weight-bold text-dark mb-1">
                  Editar usuário
                </h5>
                <small className="text-secondary">ID {usuarioEditando.id}</small>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm ml-auto"
                aria-label="Fechar"
                disabled={salvando}
                onClick={() => setUsuarioEditando(null)}
              >
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </header>
            <form onSubmit={salvarEdicao}>
              <div className="card-body p-4">
                {erroEdicao && <div className="alert alert-danger" role="alert">{erroEdicao}</div>}
                <div className="form-group">
                  <label htmlFor="users-service-username">Nome de usuário</label>
                  <input
                    id="users-service-username"
                    className="form-control"
                    required
                    value={formulario.username}
                    onChange={(event) => setFormulario((atual) => ({ ...atual, username: event.target.value }))}
                    disabled={salvando}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="users-service-first-name">Nome</label>
                    <input
                      id="users-service-first-name"
                      className="form-control"
                      value={formulario.first_name}
                      onChange={(event) => setFormulario((atual) => ({ ...atual, first_name: event.target.value }))}
                      disabled={salvando}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="users-service-last-name">Sobrenome</label>
                    <input
                      id="users-service-last-name"
                      className="form-control"
                      value={formulario.last_name}
                      onChange={(event) => setFormulario((atual) => ({ ...atual, last_name: event.target.value }))}
                      disabled={salvando}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="users-service-email">E-mail</label>
                  <input
                    id="users-service-email"
                    type="email"
                    className="form-control"
                    value={formulario.email}
                    onChange={(event) => setFormulario((atual) => ({ ...atual, email: event.target.value }))}
                    disabled={salvando}
                  />
                </div>
                <div className="border rounded p-3 bg-light">
                  <div className="custom-control custom-switch">
                    <input
                      id="users-service-superuser"
                      type="checkbox"
                      className="custom-control-input"
                      checked={formulario.is_superuser}
                      onChange={(event) => setFormulario((atual) => ({ ...atual, is_superuser: event.target.checked }))}
                      disabled={salvando}
                    />
                    <label className="custom-control-label font-weight-bold text-dark" htmlFor="users-service-superuser">
                      Superusuário
                    </label>
                  </div>
                  <small className="d-block text-secondary mt-2">
                    O acesso de equipe (is_staff) não é alterado por este formulário.
                  </small>
                </div>
              </div>
              <footer className="card-footer bg-white d-flex justify-content-end px-4 py-3" style={{ gap: "8px" }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={salvando}
                  onClick={() => setUsuarioEditando(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
