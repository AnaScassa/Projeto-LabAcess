import { useEffect, useState, useMemo } from "react";
import { calcularTempoUsuario } from "../../utils/calcularTempoUsuario";
import { mediaHorasMinutos } from "../../utils/mediaHorasMinutos";
import { minutosParaHoras } from "../../utils/horasMinutos";
import { getNomeUsuario } from "../../utils/getNomeUsuario";
import type { Relatorio } from "../../types/Relatorio";

type SortFieldPouco = "nome" | "tempoTotal";

interface CalculadorLabProps {
  usuarios: any[];
  categoriasSelecionadas: string[];
}

export default function CalculadorLab({ 
  usuarios = [] ,
  categoriasSelecionadas
}: CalculadorLabProps) {

  const [relatorio, setRelatorio] = useState<Relatorio[]>([]);
  const [totalSistema, setTotalSistema] = useState("0h 0min");
  const [contagemUsuario, setContagemUsuario] = useState(0);
  const [mediaTempo, setMediaTempo] = useState("0h 0min");
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;
  const [sortFieldPoucoTempo, setSortFieldPoucoTempo] = useState<SortFieldPouco>("nome");
  const [sortAscPouco, setSortAscPouco] = useState(true);
  const PORTA_LAB = "CCS_LAB";

  const usuariosFiltrados = usuarios.filter((u) => {
  if (categoriasSelecionadas.length === 0 ||categoriasSelecionadas.includes("todas")) {
    return true;
  }

    const ehAluno = !isNaN(Number(u.categoriaUsuario));
    
    if (ehAluno && categoriasSelecionadas.includes("ALUNO")) {
      return true;
    }

    if (u.categoriaUsuario === "FUNCIONARIO" && categoriasSelecionadas.includes("FUNCIONARIO")){
      return true;
    }

    return false;
  });

  useEffect(() => {
    const resultado: Relatorio[] = [];
    const hoje = new Date();
    const umMesAtras = new Date();

    let contadorUsuarios = 0;
    let totalGeral = 0;

    umMesAtras.setMonth(hoje.getMonth() - 1);
    usuariosFiltrados.forEach((user) => {const totalUsuario = calcularTempoUsuario(user, PORTA_LAB, umMesAtras, hoje);

      if (totalUsuario > 0) {
        contadorUsuarios++;
        totalGeral += totalUsuario;

        const { horas2, minutos2 } = minutosParaHoras(totalUsuario);

        resultado.push({
          usuario: getNomeUsuario(user.matricula, usuariosFiltrados),
          tempoTotal: `${horas2}h ${minutos2}min`,
          tempoTotalMinutos: totalUsuario,
        });
      }
    });

    const media = mediaHorasMinutos(totalGeral, contadorUsuarios);
    const total = minutosParaHoras(totalGeral);

    setRelatorio(resultado);
    setTotalSistema(`${total.horas2}h ${total.minutos2}min`);
    setContagemUsuario(contadorUsuarios);
    setMediaTempo(`${media.horas}h ${media.minutos}min`);
  }, [usuariosFiltrados]);

  const relatorioOrdenado = useMemo(() => {
    return [...relatorio].sort((a, b) => {
      if (sortFieldPoucoTempo === "nome") {
        return sortAscPouco ? a.usuario.localeCompare(b.usuario, "pt", {
          sensitivity: "base",
        }) : b.usuario.localeCompare(a.usuario, "pt", {
          sensitivity: "base",
        });
      }

      return sortAscPouco ? (a.tempoTotalMinutos || 0) - (b.tempoTotalMinutos || 0) : (b.tempoTotalMinutos || 0) - (a.tempoTotalMinutos || 0);

    });
  }, [relatorio, sortFieldPoucoTempo, sortAscPouco]);

  useEffect(() => {
    setPage(0);
  }, [relatorioOrdenado]);

  const paginaVisivel = relatorioOrdenado.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPaginas = Math.ceil(relatorioOrdenado.length / rowsPerPage);
  const getVisiblePages = (current: number, total: number) => {
    if (total <= 6) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const pages: (number | string)[] = [];

    pages.push(0);

    if (current > 3) {
      pages.push("...");
    }

    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 4) {
      pages.push("...");
    }

    pages.push(total - 1);

    return pages;
  };

  const visiblePages = getVisiblePages(page, totalPaginas);

  return (
    <div className="card-body">
      <div className="dataTables_wrapper dt-bootstrap4">

        <div className="row">
          <div className="col-sm-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover dataTable text-left">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sortFieldPoucoTempo === "nome") {
                          setSortAscPouco((prev) => !prev);
                        } else {
                          setSortFieldPoucoTempo("nome");
                          setSortAscPouco(true);
                        }
                        setPage(0);
                      }}> Usuário{" "} {sortFieldPoucoTempo === "nome" ? sortAscPouco ? "▲" : "▼" : ""}</th>

                    <th style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sortFieldPoucoTempo === "tempoTotal") {
                          setSortAscPouco((prev) => !prev);
                        } else {
                          setSortFieldPoucoTempo("tempoTotal");
                          setSortAscPouco(false);
                        }
                        setPage(0);
                      }}> Tempo total{" "} {sortFieldPoucoTempo === "tempoTotal" ? sortAscPouco ? "▲" : "▼" : ""}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {relatorio.length === 0 ? (
                    <tr>
                      <td colSpan={2}>
                        Nenhum resultado encontrado.
                      </td>
                    </tr>
                  ) : (
                    paginaVisivel.map((r, i) => (
                      <tr key={i}>
                        <td>{r.usuario}</td>
                        <td>{r.tempoTotal}</td>
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
            <div className="dataTables_info text-left"> Mostrando{" "}{relatorioOrdenado.length === 0 ? 0 : page * rowsPerPage + 1}{" "}
              a{" "} {Math.min((page + 1) * rowsPerPage, relatorioOrdenado.length)}{" "} de {relatorioOrdenado.length} registros
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
                    if (item === "...") {
                      return (
                        <li key={idx} className="paginate_button page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }

                    const pageNum = item as number;
                    return (
                      <li key={idx} className={`paginate_button page-item ${ page === pageNum ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setPage(pageNum)}>{pageNum + 1}</button>
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

        <div className="mt-3 text-left">
          <p className="mb-1">
            <strong>Total de usuários:</strong> {contagemUsuario}
          </p>

          <p className="mb-1">
            <strong>Total geral de permanência:</strong> {totalSistema}
          </p>

          <p className="mb-0">
            <strong>Média de permanência:</strong> {mediaTempo}
          </p>
        </div>

      </div>
    </div>
  );
}