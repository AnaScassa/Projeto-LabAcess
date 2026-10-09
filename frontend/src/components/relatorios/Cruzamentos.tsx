import { useEffect, useMemo, useState } from "react";
import { carregarCruzamentos, type Cruzamento } from "../../services/cruzamento";
import FiltroUsuario from "../../components/filtros/FiltroUsuario";

interface CruzamentosProps {
  paginacao?: boolean;
  mostrarCabecalho?: boolean;
}

export default function Cruzamentos({ paginacao = false, mostrarCabecalho = false }: CruzamentosProps) {
  const [cruzamentos, setCruzamentos] = useState<Cruzamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [page, setPage] = useState(0);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");

  const rowsPerPage = 15;

  useEffect(() => {
    let ativo = true;

    carregarCruzamentos().then((dados) => {
        if (ativo) setCruzamentos(dados);
      }).catch((error) => console.error("Erro ao carregar cruzamentos:", error)).finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const usuariosUnicos = useMemo(() => {
    const usuariosPorMatricula = new Map<string, string>();

    cruzamentos.forEach(({ matricula, usuario }) => {
      usuariosPorMatricula.set(matricula, usuario);
    });

    return Array.from(usuariosPorMatricula, ([matricula, nome_usuario]) => ({
      matricula,
      nome_usuario,
    }));
  }, [cruzamentos]);

  const dadosOrdenados = useMemo(() => {
    return cruzamentos.filter((cruzamento) => !usuarioSelecionado || cruzamento.matricula === usuarioSelecionado)
        .sort((a, b) => new Date(b.data_acesso).getTime() - new Date(a.data_acesso).getTime());
  }, [cruzamentos, usuarioSelecionado]);

  useEffect(() => {
    setPage(0);
  }, [cruzamentos, usuarioSelecionado]);

  const paginaVisivel = paginacao ? dadosOrdenados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : dadosOrdenados;
  const totalPaginas = Math.ceil(dadosOrdenados.length / rowsPerPage);

  const getVisiblePages = (current: number, total: number) => {
    if (total <= 6) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | string)[] = [0];
    if (current > 3) pages.push("...");

    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 4) pages.push("...");

    pages.push(total - 1);
    return pages;
  };

  const visiblePages = getVisiblePages(page, totalPaginas);

  return (
    <div className="card border-0 rounded-3 shadow-sm overflow-hidden d-flex flex-column mb-0" style={{ height: "477px", borderTop: "4px solid #ffc107" }}>
      {mostrarCabecalho && (
        <div className="card-header bg-white border-bottom px-4 py-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center">
                <i className="fas fa-history text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Histórico de Acessos sem Agendamento</h5>
              </div>
              <small className="text-secondary">Acessos identificados sem registro no agendamento MRBS</small>
            </div>

            <div className="d-flex justify-content-end">
              <div className="d-flex align-items-center pt-2">
                <label htmlFor="filtro-usuario-cruzamentos" className="form-label mb-0 fw-semibold text-secondary pr-1">Usuário:</label>
                <FiltroUsuario id="filtro-usuario-cruzamentos" usuarios={usuariosUnicos} usuarioSelecionado={usuarioSelecionado} onChange={setUsuarioSelecionado}/>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card-body p-0 overflow-auto m-0" style={{ minHeight: 0, flex: 1 }}>
        <div className="table-responsive" style={{ flex: 1, overflowY: "auto" }}>
          <table className="table table-hover mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Usuário</th>
                <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold text-center">Data do acesso</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-secondary">
                    <div className="spinner-border spinner-border-sm me-2 mr-1  " role="status" aria-hidden="true"></div>
                    Carregando dados...
                  </td>
                </tr>
              ) : dadosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-secondary">Nenhum acesso sem agendamento encontrado.</td>
                </tr>
              ) : (
                paginaVisivel.map((cruzamento) => {
                  const data = new Date(cruzamento.data_acesso);

                  return (
                    <tr key={cruzamento.id}>
                      <td className="px-4 py-3 align-middle">{cruzamento.usuario}</td>
                      <td className="px-4 py-3 align-middle text-center">
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-dark">{data.toLocaleDateString("pt-BR")}</span>
                          <small className="text-secondary">
                            {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </small>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {paginacao && (
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-3 px-4 py-3 border-top bg-white">
            <div className="d-flex justify-content-end" style={{ maxWidth: "100%", overflowX: "auto" }}>
              <div className="dataTables_paginate paging_simple_numbers">
                <ul className="pagination mb-0 flex-wrap">
                  <li className={`paginate_button page-item ${page === 0 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage((prev) => Math.max(0, prev - 1))} disabled={page === 0}>Anterior</button>
                  </li>

                  {visiblePages.map((item, idx) => {
                    if (item === "...") {
                      return (
                        <li key={idx} className="paginate_button page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }

                    const pageNum = item as number;

                    return (
                      <li key={idx} className={`paginate_button page-item ${page === pageNum ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setPage(pageNum)}>{pageNum + 1}</button>
                      </li>
                    );
                  })}

                  <li className={`paginate_button page-item ${page === totalPaginas - 1 || totalPaginas === 0 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage((prev) => Math.min(totalPaginas - 1, prev + 1))} 
                        disabled={page === totalPaginas - 1 || totalPaginas === 0}>
                      Próximo
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}