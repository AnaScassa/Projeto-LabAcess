import { useEffect, useMemo, useState } from "react";
import { calcularTempoUsuario } from "../../utils/calcularTempoUsuario";
import { getMatriculaBase } from "../../utils/getMatriculaBase";

interface SemAcessoProps {
  usuarios: any[];
  tempoInicio: Date | null;
  tempoFim: Date | null;
  categoriasSelecionadas: string[];
}

interface UsuarioSemAcesso {
  usuario: string;
}

export default function SemAcesso({
  usuarios = [],
  tempoInicio,
  tempoFim,
  categoriasSelecionadas
}: SemAcessoProps) {

  const [page, setPage] = useState(0);
  const [sortAsc, setSortAsc] = useState(true);
  const rowsPerPage = 15;
  const PORTA_LAB = "CCS_LAB";

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes("todas")) {
        return true;
      }

      const ehAluno = !isNaN(Number(u.categoriaUsuario));

      if (ehAluno && categoriasSelecionadas.includes("ALUNO")) {
        return true;
      }

      if (u.categoriaUsuario === "FUNCIONARIO" && categoriasSelecionadas.includes("FUNCIONARIO")) {
        return true;
      }

      return false;
    });
  }, [usuarios, categoriasSelecionadas]);

  const { listaSemAcesso, contagemUsuario } = useMemo(() => {
    const lista: UsuarioSemAcesso[] = [];
    let contador = 0;

    const usuariosMap: Record<string, any> = {};

    usuariosFiltrados.forEach((u) => {
      const base = getMatriculaBase(u.matricula);
      if (!usuariosMap[base]) usuariosMap[base] = u;
    });

    const usuariosUnicos = Object.values(usuariosMap);

    for (const user of usuariosUnicos) {
      const total = calcularTempoUsuario(user, PORTA_LAB, tempoInicio, tempoFim);

      if (total === 0) {
        contador++;
        lista.push({usuario: user.nome_usuario});
      }
    }

    return {
      listaSemAcesso: lista,
      contagemUsuario: contador
    };
  }, [usuariosFiltrados, tempoInicio, tempoFim]);

  useEffect(() => {
    setPage(0);
  }, [listaSemAcesso]);

  const semAcessoOrdenado = useMemo(() => {
    return [...listaSemAcesso].sort((a, b) => sortAsc ? a.usuario.localeCompare(b.usuario, "pt", { sensitivity: "base" })
      : b.usuario.localeCompare(a.usuario, "pt", { sensitivity: "base" }));
  }, [listaSemAcesso, sortAsc]);

  const paginaVisivel = semAcessoOrdenado.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPaginas = Math.ceil(semAcessoOrdenado.length / rowsPerPage);

  const getVisiblePages = (current: number, total: number) => {
    if (total <= 6) return Array.from({ length: total }, (_, i) => i);

    const pages: (number | string)[] = [];
    pages.push(0);

    if (current > 3) pages.push("...");

    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 4) pages.push("...");

    pages.push(total - 1);
    return pages;
  };

  const visiblePages = getVisiblePages(page, totalPaginas);

  return (
    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold" style={{cursor: "pointer"}} onClick={() => {setSortAsc((prev) => !prev); setPage(0);}}>
                Usuário {sortAsc ? "▲" : "▼"}
              </th>
            </tr>
          </thead>

          <tbody>
            {semAcessoOrdenado.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-center text-secondary">Todos os usuários acessaram o laboratório.</td>
              </tr>
            ) : (
              paginaVisivel.map((u, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 align-middle">{u.usuario}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 py-3">
        <div className="text-secondary small">
          <span className="fw-semibold text-dark">Total:</span> {contagemUsuario}
        </div>

        <div className="d-flex justify-content-end" style={{maxWidth: "100%", overflowX: "auto"}}>
          <div className="dataTables_paginate paging_simple_numbers">
            <ul className="pagination mb-0 flex-wrap">
              <li className={`paginate_button page-item ${page === 0 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page - 1)}>Anterior</button>
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
                    <button className="page-link" onClick={() => setPage(pageNum)}>
                      {pageNum + 1}
                    </button>
                  </li>
                );
              })}

              <li className={`paginate_button page-item ${page === totalPaginas - 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page + 1)}>Próximo</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}