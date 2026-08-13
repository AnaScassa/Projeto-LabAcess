import { useEffect, useState, useMemo } from "react";
import { calcularMinutos } from "../../utils/tempo";
import { getNomeUsuario } from "../../utils/getNomeUsuario";
import { juntarUsuariosPorMatricula } from "../../utils/juntarUsuariosPorMatricula";
import { filtrarPorData } from "../../utils/filtroData";
import { minutosParaHoras } from "../../utils/horasMinutos";
import { mediaHorasMinutos } from "../../utils/mediaHorasMinutos";
import { entradaSemSaida } from "../../utils/entradaSemSaida";
import { mesmoDia } from "../../utils/mesmoDia";

interface CalculadorTempoProps {
  usuario: any;
  usuarios?: any[];
  portasSelecionadas: string[];
  tempoInicio: Date | null;
  tempoFim: Date | null;
}

interface Resultado {
  usuario: string;
  entrada: string;
  saida: string;
  permanencia: string;
  porta: string;
  entradaTimestamp: number;
  saidaTimestamp: number;
}

type SortField = "usuario" | "entrada" | "saida" | "porta" | "permanencia";

export default function CalculadorTempo({
  usuario,
  usuarios = [],
  portasSelecionadas,
  tempoInicio,
  tempoFim
}: CalculadorTempoProps){

  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;
  const [totalAcessos, setTotalAcessos] = useState(0);
  const [totalAcessosErro, setTotalAcessosErro] = useState(0);
  const [mediaTempo, setMediaTempo] = useState("0h 0min");
  const [totalSistema, setTotalSistema] = useState("0h 0min");
  const [sortField, setSortField] = useState<SortField>("usuario");
  const [sortAsc, setSortAsc] = useState(true);

  const resultadosOrdenados = useMemo(() => {
    return [...resultados].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "usuario":
          aValue = a.usuario;
          bValue = b.usuario;
          return sortAsc
            ? aValue.localeCompare(bValue, "pt", { sensitivity: "base" })
            : bValue.localeCompare(aValue, "pt", { sensitivity: "base" });

        case "porta":
          aValue = a.porta;
          bValue = b.porta;
          return sortAsc
            ? aValue.localeCompare(bValue, "pt", { sensitivity: "base" })
            : bValue.localeCompare(aValue, "pt", { sensitivity: "base" });

        case "entrada":
          aValue = a.entradaTimestamp;
          bValue = b.entradaTimestamp;
          return sortAsc ? aValue - bValue : bValue - aValue;

        case "saida":
          aValue = a.saidaTimestamp;
          bValue = b.saidaTimestamp;
          return sortAsc ? aValue - bValue : bValue - aValue;

        case "permanencia":
          const parseTempo = (tempo: string) => {
            if (tempo === "Indisponível") return 0;
            const match = tempo.match(/(\d+)h (\d+)min/);
            if (match) {
              return parseInt(match[1]) * 60 + parseInt(match[2]);
            }
            return 0;
          };
          aValue = parseTempo(a.permanencia);
          bValue = parseTempo(b.permanencia);
          return sortAsc ? aValue - bValue : bValue - aValue;

        default:
          return 0;
      }
    });
  }, [resultados, sortField, sortAsc]);

  useEffect(() => {
    setPage(0);
  }, [resultadosOrdenados]);

  const paginaVisivel = resultadosOrdenados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPaginas = Math.ceil(resultadosOrdenados.length / rowsPerPage);

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
  }, [resultados]);

  useEffect(() => {
    if (!usuario) {
      setResultados([]);
      return;
    }
    const usuarioUnificado = juntarUsuariosPorMatricula(usuario, usuarios);
    calcularPermanencia(usuarioUnificado, portasSelecionadas);
  }, [usuario, portasSelecionadas, usuarios, tempoInicio, tempoFim]);

  function calcularPermanencia(user: any, portas: string[] = []) {
    let contagemAcessos = 0;
    let contagemErro = 0;
    let totalGeral = 0;
    let acessos = [...(user.acessos || [])];

    acessos = filtrarPorData(acessos, tempoInicio, tempoFim);

    if (portas.length > 0 && !portas.includes("todas")) {
      acessos = acessos.filter((a: any) => portas.includes(a.desc_area));
    }

    const ordenado = [...acessos].sort((a: any, b: any) => new Date(a.data_acesso).getTime() - new Date(b.data_acesso).getTime());
    const stacks: Record<string, Date | null> = {};
    const out: Resultado[] = [];

    ordenado.forEach((acesso: any) => {
      const tipo = acesso.ent_sai === "1" ? "ENTRADA" : "SAIDA";
      const dataHora = new Date(acesso.data_acesso);
      const dataHoraStr = dataHora.toLocaleString();
      const area = acesso.desc_area;

      if (!(area in stacks)) stacks[area] = null;

      const stack = stacks[area];

      if (tipo === "ENTRADA") {
        if (stack !== null) {
          contagemErro++;
          out.push(
            entradaSemSaida({
              user,
              usuarios,
              stack,
              area,
              getNomeUsuario
            })
          );
        }
        stacks[area] = dataHora;
        return;
      }

      if (tipo === "SAIDA") {
        if (stack) {
          if (mesmoDia(stack, dataHora)) {
            const totalMinutos = calcularMinutos(stack, dataHora);
            const { horas2, minutos2 } = minutosParaHoras(totalMinutos);
            contagemAcessos++;
            totalGeral += totalMinutos;

            out.push({
              usuario: getNomeUsuario(user.matricula, usuarios),
              entrada: stack.toLocaleString(),
              saida: dataHoraStr,
              permanencia: `${horas2}h ${minutos2}min`,
              porta: area,
              entradaTimestamp: stack.getTime(),
              saidaTimestamp: dataHora.getTime()
            });

          } else {
            contagemErro++;
            out.push(
              entradaSemSaida({
                user,
                usuarios,
                stack,
                area,
                getNomeUsuario
              })
            );
          }

          stacks[area] = null;

        } else {
          contagemErro++;
          out.push({
            usuario: getNomeUsuario(user.matricula, usuarios),
            entrada: "Saída sem entrada",
            saida: dataHoraStr,
            permanencia: "Indisponível",
            porta: area,
            entradaTimestamp: 0,
            saidaTimestamp: dataHora.getTime()
          });
        }
      }
    });

    Object.keys(stacks).forEach((area) => {
      const st = stacks[area];

      if (st) {
        contagemErro++;
        out.push(
          entradaSemSaida({
            user,
            usuarios,
            stack: st,
            area,
            getNomeUsuario
          })
        );
      }
    });

    const { horas, minutos } = mediaHorasMinutos(totalGeral, contagemAcessos);
    const { horas2, minutos2 } = minutosParaHoras(totalGeral);

    setMediaTempo(`${horas}h ${minutos}min`);
    setResultados(out);
    setTotalAcessos(contagemAcessos);
    setTotalAcessosErro(contagemErro);
    setTotalSistema(`${horas2}h ${minutos2}min`);
  }

  return (
    <div className="card-body">
      <div className="dataTables_wrapper dt-bootstrap4">

        <div className="row">
          <div className="col-sm-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover dataTable text-left">
                <thead>
                  <tr>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sortField === "usuario") {
                          setSortAsc((prev) => !prev);
                        } else {
                          setSortField("usuario");
                          setSortAsc(true);
                        }
                        setPage(0);
                      }}>Usuário {sortField === "usuario" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sortField === "entrada") {
                          setSortAsc((prev) => !prev);
                        } else {
                          setSortField("entrada");
                          setSortAsc(true);
                        }
                        setPage(0);
                      }}>Entrada {sortField === "entrada" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sortField === "saida") {
                          setSortAsc((prev) => !prev);
                        } else {
                          setSortField("saida");
                          setSortAsc(true);
                        }
                        setPage(0);
                      }}>Saída {sortField === "saida" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sortField === "porta") {
                          setSortAsc((prev) => !prev);
                        } else {
                          setSortField("porta");
                          setSortAsc(true);
                        }
                        setPage(0);
                      }}>Porta {sortField === "porta" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sortField === "permanencia") {
                          setSortAsc((prev) => !prev);
                        } else {
                          setSortField("permanencia");
                          setSortAsc(true);
                        }
                        setPage(0);
                      }}>Tempo Permanência {sortField === "permanencia" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginaVisivel.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        Nenhum resultado encontrado.
                      </td>
                    </tr>
                  ) : (
                    paginaVisivel.map((r, i) => (
                      <tr key={i}>
                        <td>{r.usuario}</td>
                        <td>{r.entrada}</td>
                        <td>{r.saida}</td>
                        <td>{r.porta}</td>
                        <td>{r.permanencia}</td>
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
              Mostrando {resultadosOrdenados.length === 0 ? 0 : page * rowsPerPage + 1} a{" "}
              {Math.min((page + 1) * rowsPerPage, resultadosOrdenados.length)} de{" "}
              {resultadosOrdenados.length} registros
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

        <div className="mt-3 text-left">
          <p className="mb-1">
            <strong>Total de acessos com entrada e saída:</strong> {totalAcessos}
          </p>
          <p className="mb-1">
            <strong>Total de acessos com erro:</strong> {totalAcessosErro}
          </p>
          <p className="mb-1">
            <strong>Total de Tempo Permanência:</strong> {totalSistema}
          </p>
          <p className="mb-0">
            <strong>Média de Tempo Permanência:</strong> {mediaTempo}
          </p>
        </div>
      </div>
    </div>
  );
}