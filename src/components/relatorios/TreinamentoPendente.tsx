import { useState, useMemo, useEffect } from "react";

import { getUserFullName } from "../../utils/getUserFullName";
import type { Users } from "../../types/Users";
import type { Treinamento } from "../../types/Treinamento";

interface Props {
  users: Users[];
  treinamentos: Treinamento[];
}

export default function CalculadorTreinamentoPendente({
  users,
  treinamentos,
}: Props) {
  const [page, setPage] = useState(0);
  const [sortAsc, setSortAsc] = useState(true);
  const rowsPerPage = 15;

  const usersMap = useMemo(() => {
    return Object.fromEntries(users.map((u) => [u.id, u]));
  }, [users]);

  const treinamentosPendentes = useMemo(() => {
    const nomes = treinamentos
      .filter((t) => !t.expiration_date)
      .map((t) => {
        const user = usersMap[t.user_id];
        return user ? getUserFullName(user) : null;
      })
      .filter(Boolean) as string[];

    const nomesUnicos = [...new Set(nomes)];
    return nomesUnicos.sort((a, b) =>
      sortAsc
        ? a.localeCompare(b, "pt", { sensitivity: "base" })
        : b.localeCompare(a, "pt", { sensitivity: "base" })
    );
  }, [treinamentos, usersMap, sortAsc]);

  const paginaVisivel = treinamentosPendentes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPaginas = Math.ceil(treinamentosPendentes.length / rowsPerPage);

  const getVisiblePages = (current: number, total: number) => {
    if (total <= 6) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | string)[] = [];
    pages.push(0);
    if (current > 3) pages.push('...');
    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (current < total - 4) pages.push('...');
    pages.push(total - 1); 
    return pages;
  };

  const visiblePages = getVisiblePages(page, totalPaginas);

  useEffect(() => {
    setPage(0);
  }, [treinamentosPendentes]);

  return (
    <div className="card-body">
      <div className="dataTables_wrapper dt-bootstrap4">

        <div className="row">
          <div className="col-sm-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover dataTable text-left">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => {
                        setSortAsc((prev) => !prev);
                        setPage(0);
                      }}>Usuário {sortAsc ? "▲" : "▼"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginaVisivel.length === 0 ? (
                    <tr>
                      <td>Nenhum resultado encontrado.</td>
                    </tr>
                  ) : (
                    paginaVisivel.map((nome, i) => (
                      <tr key={i}>
                        <td>{nome}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-md-5">
            <div className="dataTables_info text-left">
              Mostrando {treinamentosPendentes.length === 0 ? 0 : page * rowsPerPage + 1} a{" "}
              {Math.min((page + 1) * rowsPerPage, treinamentosPendentes.length)} de{" "}
              {treinamentosPendentes.length} registros
            </div>
          </div>

          <div className="col-sm-12 col-md-7 d-flex justify-content-md-end justify-content-start">
            <div style={{ maxWidth: "90%", overflowX: "auto" }}>
              <div className="dataTables_paginate paging_simple_numbers">
                <ul className="pagination flex-wrap">

                  <li className={`paginate_button page-item ${page === 0 && "disabled"}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)}>Anterior</button>
                  </li>

                  {visiblePages.map((item, idx) => {
                    if (item === '...') {
                      return (
                        <li key={idx} className="paginate_button page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    const pageNum = item as number;
                    return (
                      <li
                        key={idx}
                        className={`paginate_button page-item ${page === pageNum ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setPage(pageNum)}>
                          {pageNum + 1}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`paginate_button page-item ${page === totalPaginas - 1 && "disabled"}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)}>Próximo</button>
                  </li>

                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}