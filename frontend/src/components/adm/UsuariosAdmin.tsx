import { useEffect, useMemo, useState, type FormEvent } from "react";
import TableBody from "../style/TableBody";
import FiltroCategoriaCheckbox from "../filtros/CategoriaCheckbox";
import { atualizarUsuarioSmartcard, carregarUsuariosSmartcard } from "../../services/usuarios";
import type { Usuario } from "../../types/Usuario";

const categoriasPadrao = ["todas", "ALUNO", "FUNCIONARIO"];
const rowsPerPage = 15;
const acessosPorPagina = 10;

type FormularioUsuario = {
  matricula: string;
  nome_usuario: string;
  categoriaUsuario: string;
  user_auth_id: string;
  username_mrbs: string;
};

function getVisiblePages(current: number, total: number): (number | string)[] {
  if (total <= 6) return Array.from({ length: total }, (_, index) => index);

  const pages: (number | string)[] = [0];
  if (current > 3) pages.push("...");

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  for (let index = start; index <= end; index++) {
    pages.push(index);
  }

  if (current < total - 4) pages.push("...");
  pages.push(total - 1);
  return pages;
}

function ehAluno(categoria: string | null) {
  if (!categoria) return false;
  return categoria.toUpperCase() === "ALUNO" || !Number.isNaN(Number(categoria));
}

function formatarData(data: string | null) {
  return data ? new Date(data).toLocaleString("pt-BR") : "Sem registro";
}

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState(categoriasPadrao);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formulario, setFormulario] = useState<FormularioUsuario>({
    matricula: "",
    nome_usuario: "",
    categoriaUsuario: "",
    user_auth_id: "",
    username_mrbs: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);
  const [paginaAcessos, setPaginaAcessos] = useState(0);

  useEffect(() => {
    async function carregar() {
      try {
        setUsuarios(await carregarUsuariosSmartcard());
      } catch (error) {
        console.error("Erro ao carregar usuários do SmartCard:", error);
        setErro("Não foi possível carregar os usuários do SmartCard.");
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const categoria = usuario.categoriaUsuario?.toUpperCase();
      const correspondeCategoria = categoriasSelecionadas.includes("todas")
        || (categoriasSelecionadas.includes("ALUNO") && ehAluno(usuario.categoriaUsuario))
        || (categoriasSelecionadas.includes("FUNCIONARIO") && categoria === "FUNCIONARIO");
      const termo = busca.trim().toLocaleLowerCase();
      const correspondeBusca = !termo
        || usuario.nome_usuario.toLocaleLowerCase().includes(termo)
        || usuario.matricula.toLocaleLowerCase().includes(termo);

      return correspondeCategoria && correspondeBusca;
    });
  }, [usuarios, categoriasSelecionadas, busca]);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / rowsPerPage);
  const paginaVisivel = usuariosFiltrados.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const visiblePages = getVisiblePages(page, totalPaginas);
  const totalPaginasAcessos = Math.ceil((usuarioSelecionado?.acessos.length ?? 0) / acessosPorPagina);
  const acessosVisiveis = usuarioSelecionado?.acessos.slice(
    paginaAcessos * acessosPorPagina,
    (paginaAcessos + 1) * acessosPorPagina,
  ) ?? [];

  useEffect(() => {
    setPage(0);
  }, [usuariosFiltrados]);

  useEffect(() => {
    if (totalPaginas > 0 && page >= totalPaginas) {
      setPage(totalPaginas - 1);
    }
  }, [page, totalPaginas]);

  useEffect(() => {
    if (!usuarioSelecionado) return;

    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !salvando) setUsuarioSelecionado(null);
    };

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [usuarioSelecionado, salvando]);

  const abrirEdicao = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModoEdicao(true);
    setErroEdicao(null);
    setFormulario({
      matricula: usuario.matricula,
      nome_usuario: usuario.nome_usuario,
      categoriaUsuario: usuario.categoriaUsuario ?? "",
      user_auth_id: usuario.user_auth_id === null ? "" : String(usuario.user_auth_id),
      username_mrbs: usuario.username_mrbs ?? "",
    });
  };

  const salvarEdicao = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!usuarioSelecionado) return;

    const userAuthId = formulario.user_auth_id.trim();
    if (userAuthId && !/^\d+$/.test(userAuthId)) {
      setErroEdicao("O ID do usuário deve conter apenas números.");
      return;
    }

    setSalvando(true);
    setErroEdicao(null);
    try {
      const atualizado = await atualizarUsuarioSmartcard(usuarioSelecionado.id, {
        matricula: formulario.matricula.trim(),
        nome_usuario: formulario.nome_usuario.trim(),
        categoriaUsuario: formulario.categoriaUsuario.trim() || null,
        user_auth_id: userAuthId ? Number(userAuthId) : null,
        username_mrbs: formulario.username_mrbs.trim() || null,
      });
      setUsuarios((atuais) => atuais.map((usuario) => usuario.id === atualizado.id ? atualizado : usuario));
      setUsuarioSelecionado(null);
    } catch (error) {
      console.error("Erro ao salvar alterações do usuário:", error);
      setErroEdicao("Não foi possível salvar as alterações. Verifique sua permissão e tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <div className="mb-3">
        <h5 className="font-weight-bold text-dark mb-3">Usuários do SmartCard</h5>
        <div className="d-flex flex-column flex-md-row align-items-md-end gap-3">
          <div className="flex-grow-1">
            <FiltroCategoriaCheckbox selecionadas={categoriasSelecionadas} onChange={setCategoriasSelecionadas}/>
          </div>
          <div className="form-group mb-0" style={{ width: "100%", maxWidth: "320px" }}>
            <label htmlFor="busca-usuarios-smartcard" className="form-label mb-1 fw-semibold text-secondary">
              Buscar nome ou matrícula:
            </label>
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
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Matrícula</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Nome</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Categoria</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">ID do usuário</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Usuário MRBS</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Ações</th>
            </tr>
          </thead>
          <TableBody
            data={paginaVisivel}
            colSpan={7}
            loading={carregando}
            emptyMessage={erro ? "Não foi possível carregar os usuários." : "Nenhum usuário encontrado para esse filtro."}
            renderRow={(usuario) => (
              <tr key={usuario.id}>
                <td className="px-4 py-3 align-middle">{usuario.id}</td>
                <td className="px-4 py-3 align-middle">{usuario.matricula}</td>
                <td className="px-4 py-3 align-middle">{usuario.nome_usuario}</td>
                <td className="px-4 py-3 align-middle">{usuario.categoriaUsuario || "Sem registro"}</td>
                <td className="px-4 py-3 align-middle">{usuario.user_auth_id ?? "Sem registro"}</td>
                <td className="px-4 py-3 align-middle">{usuario.username_mrbs || "Sem registro"}</td>
                <td className="px-4 py-3 align-middle">
                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline-primary btn-sm text-nowrap mr-1" onClick={() => {
                      setUsuarioSelecionado(usuario);
                      setModoEdicao(false);
                      setPaginaAcessos(0);
                    }}>
                      <i className="fas fa-list-ul mr-1"></i>
                      Acessos ({usuario.acessos.length})
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-sm text-nowrap" onClick={() => abrirEdicao(usuario)}>
                      <i className="fas fa-edit mr-1"></i> Editar
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        </table>
      </div>

      {!carregando && usuariosFiltrados.length > 0 && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 py-3 border-top">
          <div className="text-secondary small">
            Mostrando {page * rowsPerPage + 1} a{" "}
            {Math.min((page + 1) * rowsPerPage, usuariosFiltrados.length)} de{" "}
            {usuariosFiltrados.length} registros
          </div>

          <div className="d-flex justify-content-end" style={{ maxWidth: "100%", overflowX: "auto" }}>
            <div className="dataTables_paginate paging_simple_numbers">
              <ul className="pagination mb-0 flex-wrap">
                <li className={`paginate_button page-item ${page === 0 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}>
                    Anterior
                  </button>
                </li>

                {visiblePages.map((item, index) => item === "..." ? (
                  <li key={`ellipsis-${index}`} className="paginate_button page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                ) : (
                  <li key={item} className={`paginate_button page-item ${page === item ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(Number(item))}>
                      {Number(item) + 1}
                    </button>
                  </li>
                ))}

                <li className={`paginate_button page-item ${page >= totalPaginas - 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((current) => Math.min(totalPaginas - 1, current + 1))} disabled={page >= totalPaginas - 1}>
                    Próximo
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {usuarioSelecionado && (
        <div className="position-fixed d-flex align-items-center justify-content-center p-3" 
          style={{ inset: 0, zIndex: 1050, backgroundColor: "rgba(0, 0, 0, 0.5)" }} onClick={() => setUsuarioSelecionado(null)}
        >
          <section className="card border-0 rounded-lg shadow-lg w-100 mb-0" role="dialog" aria-modal="true" aria-labelledby="acessos-usuario-titulo"
            style={{maxWidth: "1000px", height: "min(90vh, 700px)", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden"}}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center flex-shrink-0 w-100">
              <div className="d-flex flex-column align-items-start flex-grow-1">
                <h5 id="acessos-usuario-titulo" className="font-weight-bold text-dark mb-1">
                  {modoEdicao ? "Editar usuário" : `Acessos de ${usuarioSelecionado.nome_usuario}`}
                </h5>
                <small className="text-secondary">
                  {modoEdicao
                    ? `ID ${usuarioSelecionado.id} · ${usuarioSelecionado.matricula}`
                    : `Matrícula ${usuarioSelecionado.matricula} · ${usuarioSelecionado.acessos.length} registro(s)`}
                </small>
              </div>
              <div className="d-flex align-items-start flex-shrink-0 ml-auto">
                <button type="button" className="btn btn-outline-secondary btn-sm" aria-label="Fechar" disabled={salvando} onClick={() => setUsuarioSelecionado(null)}>
                  <i className="fas fa-times mr-0"></i>
                </button>
              </div>
            </header>

            {modoEdicao ? (
              <form id="usuario-edicao-form" className="card-body overflow-auto" style={{ minHeight: 0, flex: "1 1 auto" }} onSubmit={salvarEdicao}>
                {erroEdicao && <div className="alert alert-danger" role="alert">{erroEdicao}</div>}
                <div className="form-group mb-3">
                  <label htmlFor="usuario-matricula">Matrícula</label>
                  <input id="usuario-matricula" className="form-control" value={formulario.matricula} onChange={(event) => setFormulario({ ...formulario, matricula: event.target.value })} required />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="usuario-nome">Nome</label>
                  <input id="usuario-nome" className="form-control" value={formulario.nome_usuario} onChange={(event) => setFormulario({ ...formulario, nome_usuario: event.target.value })} required />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="usuario-categoria">Categoria</label>
                  <input id="usuario-categoria" className="form-control" value={formulario.categoriaUsuario} onChange={(event) => setFormulario({ ...formulario, categoriaUsuario: event.target.value })} placeholder="FUNCIONARIO ou código de aluno" />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="usuario-auth-id">ID do usuário associado</label>
                  <input id="usuario-auth-id" type="number" min="0" className="form-control" value={formulario.user_auth_id} onChange={(event) => setFormulario({ ...formulario, user_auth_id: event.target.value })} />
                </div>
                <div className="form-group mb-0">
                  <label htmlFor="usuario-mrbs">Usuário MRBS</label>
                  <input id="usuario-mrbs" className="form-control" value={formulario.username_mrbs} onChange={(event) => setFormulario({ ...formulario, username_mrbs: event.target.value })} />
                </div>
              </form>
            ) : (
            <div className="card-body p-0 overflow-auto" style={{ minHeight: 0, flex: "1 1 auto" }}>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">ID</th>
                      <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Data</th>
                      <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Área</th>
                      <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Entrada/saída</th>
                      <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Agendado</th>
                      <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Apontamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acessosVisiveis.map((acesso) => (
                      <tr key={acesso.id}>
                        <td className="px-4 py-3 align-middle">{acesso.id}</td>
                        <td className="px-4 py-3 align-middle text-nowrap">{formatarData(acesso.data_acesso)}</td>
                        <td className="px-4 py-3 align-middle">{acesso.desc_area}</td>
                        <td className="px-4 py-3 align-middle">{acesso.ent_sai}</td>
                        <td className="px-4 py-3 align-middle">{acesso.eh_agendado ? "Sim" : "Não"}</td>
                        <td className="px-4 py-3 align-middle">{acesso.apontamento ?? "Sem registro"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            <footer className="card-footer bg-white d-flex flex-wrap align-items-center gap-3 px-4 py-3 flex-shrink-0">
              {modoEdicao ? (
                <>
                  <span className="text-secondary small">Salve para atualizar o cadastro no SmartCard.</span>
                  <div className="d-flex gap-2 ml-auto">
                    <button type="button" className="btn btn-outline-secondary mr-1" onClick={() => setModoEdicao(false)} disabled={salvando}>Cancelar</button>
                    <button type="submit" form="usuario-edicao-form" className="btn btn-primary" disabled={salvando}>
                      {salvando ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </>
              ) : (
              <>
              <span className="text-secondary small">
                Mostrando {paginaAcessos * acessosPorPagina + 1} a{" "}
                {Math.min((paginaAcessos + 1) * acessosPorPagina, usuarioSelecionado.acessos.length)} de{" "}
                {usuarioSelecionado.acessos.length} registros
              </span>
              <nav className="ml-auto" aria-label="Paginação dos acessos">
                <ul className="pagination mb-0">
                  <li className={`page-item ${paginaAcessos === 0 ? "disabled" : ""}`}>
                    <button type="button" className="page-link" disabled={paginaAcessos === 0} onClick={() => setPaginaAcessos((current) => Math.max(0, current - 1))}>
                      Anterior
                    </button>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link">{paginaAcessos + 1} / {totalPaginasAcessos}</span>
                  </li>
                  <li className={`page-item ${paginaAcessos >= totalPaginasAcessos - 1 ? "disabled" : ""}`}>
                    <button type="button" className="page-link" disabled={paginaAcessos >= totalPaginasAcessos - 1}
                      onClick={() => setPaginaAcessos((current) => Math.min(totalPaginasAcessos - 1, current + 1))}
                    >
                      Próximo
                    </button>
                  </li>
                </ul>
              </nav>
              </>
              )}
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
