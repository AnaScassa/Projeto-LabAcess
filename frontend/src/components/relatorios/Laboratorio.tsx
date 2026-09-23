import { useEffect, useState, useMemo } from "react";
import { mediaHorasMinutos } from "../../utils/mediaHorasMinutos";
import { processarResultadoUsuario } from "../../utils/processarResultadoUsuario";
import { calcularTempoUsuario } from "../../utils/calcularTempoUsuario";
import { minutosParaHoras } from "../../utils/horasMinutos";
import type { Relatorio } from "../../types/Relatorio";

interface CalculadorLabProps {
  usuarios: any[];
  tempoInicio: Date | null;
  tempoFim: Date | null;
  categoriasSelecionadas: string[];
}

type SortField = "usuario" | "tempoTotal";

export default function CalculadorLab({
  usuarios = [],
  tempoInicio,
  tempoFim,
  categoriasSelecionadas
}: CalculadorLabProps) {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("usuario");
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

  const calculo = useMemo(() => {
    const resultado: Relatorio[] = [];
    let contadorUsuarios = 0;
    let totalGeral = 0;

    usuariosFiltrados.forEach((user) => {
      const totalUsuario = calcularTempoUsuario(user, PORTA_LAB, tempoInicio, tempoFim);

      if (totalUsuario > 0) {
        totalGeral += totalUsuario;
      }

      contadorUsuarios = processarResultadoUsuario(totalUsuario, user, usuariosFiltrados, resultado, contadorUsuarios);
    });

    const { horas, minutos } = mediaHorasMinutos(totalGeral, contadorUsuarios);
    const { horas2, minutos2 } = minutosParaHoras(totalGeral);

    return {
      relatorio: resultado,
      contagemUsuario: contadorUsuarios,
      totalSistema: `${horas2}h ${minutos2}min`,
      mediaTempo: `${horas}h ${minutos}min`
    };
  }, [usuariosFiltrados, tempoInicio, tempoFim]);


  const relatorio = calculo.relatorio;
  const contagemUsuario = calculo.contagemUsuario;
  const totalSistema = calculo.totalSistema;
  const mediaTempo = calculo.mediaTempo;

  const relatorioOrdenado = useMemo(() => {
    return [...relatorio].sort((a, b) => {
      if (sortField === "usuario") {
        return sortAsc ? a.usuario.localeCompare(b.usuario, "pt", { sensitivity: "base" }) : b.usuario.localeCompare(a.usuario, "pt", { sensitivity: "base" });
      }

      const parseTempo = (tempo: string) => {
        if (tempo === "Indisponível") return 0;
        const match = tempo.match(/(\d+)h (\d+)min/);
        if (match) {
          return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        }
        return 0;
      };

      const aValue = parseTempo(a.tempoTotal);
      const bValue = parseTempo(b.tempoTotal);

      return sortAsc ? aValue - bValue : bValue - aValue;
    });
  }, [relatorio, sortField, sortAsc]);

  const paginaVisivel = relatorioOrdenado.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPaginas = Math.ceil(relatorioOrdenado.length / rowsPerPage);

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

  useEffect(() => {
    setPage(0);
  }, [relatorio]);

  return (
    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold" style={{cursor: "pointer"}} onClick={() => {if (sortField === "usuario") {setSortAsc((prev) => !prev);} else {setSortField("usuario"); setSortAsc(true);} setPage(0);}}>
                Usuário {sortField === "usuario" ? (sortAsc ? "▲" : "▼") : ""}
              </th>

              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold" style={{cursor: "pointer"}} onClick={() => {if (sortField === "tempoTotal") {setSortAsc((prev) => !prev);} else {setSortField("tempoTotal"); setSortAsc(false);} setPage(0);}}>
                Tempo total {sortField === "tempoTotal" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>

          <tbody>
            {relatorioOrdenado.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-4 text-center text-secondary">
                  Nenhum resultado encontrado.
                </td>
              </tr>
            ) : (
              paginaVisivel.map((r, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 align-middle">{r.usuario}</td>
                  <td className="px-4 py-3 align-middle">{r.tempoTotal}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 py-3 border-top">
        <div className="text-secondary small">
          Mostrando {relatorioOrdenado.length === 0 ? 0 : page * rowsPerPage + 1} a{" "}
          {Math.min((page + 1) * rowsPerPage, relatorioOrdenado.length)} de{" "}
          {relatorioOrdenado.length} registros
        </div>

        <div className="d-flex justify-content-end" style={{maxWidth: "100%", overflowX: "auto"}}>
          <div className="dataTables_paginate paging_simple_numbers">
            <ul className="pagination mb-0 flex-wrap">

              <li className={`paginate_button page-item ${page === 0 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page - 1)}>
                  Anterior
                </button>
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
                <button className="page-link" onClick={() => setPage(page + 1)}>
                  Próximo
                </button>
              </li>

            </ul>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-top">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100 bg-white">
              <small className="text-secondary d-block mb-1">Total geral de permanência</small>
              <span className="fw-semibold text-dark">{totalSistema}</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100 bg-white">
              <small className="text-secondary d-block mb-1">Total de usuários</small>
              <span className="fw-semibold text-dark">{contagemUsuario}</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100 bg-white">
              <small className="text-secondary d-block mb-1">Média de permanência</small>
              <span className="fw-semibold text-dark">{mediaTempo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}