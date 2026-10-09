import { useEffect, useMemo, useState } from "react";
import { buscarAcessosAgendados, type AcessoAgendado } from "../../services/acessosAgendados";

const AcessosAgendados = () => {
  const [dados, setDados] = useState<AcessoAgendado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [page, setPage] = useState(0);
  const [sortAsc, setSortAsc] = useState(true);
  const rowsPerPage = 15;

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resposta = await buscarAcessosAgendados();
        setDados(resposta);
      } catch (error) {
        console.error("Erro ao carregar acessos agendados:", error);
        setDados([]);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const dadosOrdenados = useMemo(() => {
    return [...dados].sort((a, b) => sortAsc ? a.usuario.localeCompare(b.usuario, "pt", { sensitivity: "base" }) : 
      b.usuario.localeCompare(a.usuario, "pt", { sensitivity: "base" }));
  }, [dados, sortAsc]);

  const totalMes = useMemo(() => dados.reduce((total, item) => total + item.quantidade, 0), [dados]);

  useEffect(() => {
    setPage(0);
  }, [dados]);

  const paginaVisivel = dadosOrdenados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
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
    <div className="card rounded-3 shadow-sm overflow-hidden" style={{ height: "450px",  borderTop: "4px solid #28a745" }}>
      <div className="card-header bg-white border-bottom px-4 py-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center">
              <i className="fas fa-calendar-check text-primary me-2"></i>
              <h5 className="mb-0 fw-semibold text-dark">Acessos agendados</h5>
            </div>
            <small className="text-secondary">Quantidade de vezes que cada usuário agendou e entrou no CCS_LAB</small>
          </div>

          <div className="text-end">
            <div className="text-secondary small text-uppercase fw-semibold">TOTAL:</div>
            <div className="fs-3 fw-bold text-primary align-items-center justify-content-center d-flex">{totalMes}</div>
          </div>
        </div>
      </div>

      <div className="card-body p-0 d-flex flex-column" style={{ minHeight: 0, flex: 1 }}>
        <div className="table-responsive" style={{ flex: 1, overflowY: "auto" }}>
          <table className="table table-hover mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold" style={{ cursor: "pointer" }} 
                  onClick={() => { setSortAsc((prev) => !prev); setPage(0); }}>Usuário {sortAsc ? "▲" : "▼"}</th>
                <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold text-center">Agendou e entrou</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-secondary">
                    <div className="spinner-border spinner-border-sm me-2 mr-1" role="status" aria-hidden="true"></div>
                    Carregando dados...
                  </td>
                </tr>
              ) : dadosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-secondary">Nenhum acesso agendado encontrado.</td>
                </tr>
              ) : (
                paginaVisivel.map((item, i) => (
                  <tr key={item.matricula || i}>
                    <td className="px-4 py-3 align-middle">{item.usuario}</td>
                    <td className="px-4 py-3 align-middle text-center">
                      <span className="badge bg-success-subtle text-secondary rounded-pill px-3 py-2">{item.quantidade}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-end gap-3 px-4 py-3 border-top bg-white">

          <div className="d-flex justify-content-end" style={{ maxWidth: "100%", overflowX: "auto" }}>
            <div className="dataTables_paginate paging_simple_numbers">
              <ul className="pagination mb-0 flex-wrap">
                <li className={`paginate_button page-item ${page === 0 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 0}>Anterior</button>
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
                  <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPaginas - 1 || totalPaginas === 0}>
                    Próximo
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcessosAgendados;