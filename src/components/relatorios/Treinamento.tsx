import { useState, useMemo, useEffect } from "react";

import type { Users } from "../../types/Users";
import type { Usuario } from "../../types/Usuario";
import type { Treinamento } from "../../types/Treinamento";

type RowPoucoAcesso = {
  nome: string;
  dataExp: string;
  dataExpRaw: Date;
  ultimoAcesso: string;
  ultimoAcessoRaw: Date | null;
  tempoSemEntrar: string;
  tempoSemEntrarRaw: number;
  acessos: number;
  acessosUltimos10Meses: number;
};

type RowMuitoAcesso = {
  nome: string;
  ultimoAcesso: string;
  ultimoAcessoRaw: Date | null;
  tempoSemEntrar: string;
  tempoSemEntrarRaw: number;
  acessosUltimos10Meses: number;
};

type SortFieldPouco = | "nome" | "dataExp" | "ultimoAcesso"| "tempoSemEntrar" | "acessos" | "acessosUltimos10Meses";

type SortFieldMuito = | "nome" | "ultimoAcesso" | "tempoSemEntrar" | "acessosUltimos10Meses";

interface Props {
  users: Users[];
  usuarios: Usuario[];
  treinamentos: Treinamento[];
  portasSelecionadas: string[];
}

const getNomeHelper = (u: Users) => {
  if (u.full_name?.trim()) return u.full_name;
  const nomeCompleto = `${u.first_name} ${u.last_name}`.trim();
  if (nomeCompleto) return nomeCompleto;
  return u.username;
};

const contarAcessosHelper = (
  usuario: Usuario,
  dataExp: string,
  portasSelecionadas: string[]
) => {
  if (!usuario?.acessos) return 0;
  const dataExpiracao = new Date(dataExp);
  let acessos = usuario.acessos.filter(
    (a) => new Date(a.data_acesso) <= dataExpiracao && a.ent_sai === "1"
  );
  if (portasSelecionadas.length > 0 && !portasSelecionadas.includes("todas")) {
    acessos = acessos.filter((a) => portasSelecionadas.includes(a.desc_area));
  }
  return acessos.length;
};

const getUltimoAcessoHelper = (
  usuario: Usuario,
  portasSelecionadas: string[]
) => {
  if (!usuario?.acessos?.length) return null;
  let acessos = usuario.acessos.filter((a) => a.ent_sai === "1");
  if (portasSelecionadas.length > 0 && !portasSelecionadas.includes("todas")) {
    acessos = acessos.filter((a) => portasSelecionadas.includes(a.desc_area));
  }
  const ultimo = acessos
    .map((a) => new Date(a.data_acesso))
    .filter((dt) => !Number.isNaN(dt.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  return ultimo || null;
};

const formatTempoSemEntrarHelper = (ultimoAcesso: Date | null) => {
  if (!ultimoAcesso) return "Sem acessos";
  const agora = new Date();
  const diffMs = agora.getTime() - ultimoAcesso.getTime();
  if (diffMs <= 0) return "agora";
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const parts: string[] = [];
  if (diffDays > 0) parts.push(`${diffDays} dia${diffDays === 1 ? "" : "s"}`);
  const hoursRest = diffHours % 24;
  if (hoursRest > 0) parts.push(`${hoursRest} hora${hoursRest === 1 ? "" : "s"}`);
  const minutesRest = diffMinutes % 60;
  if (minutesRest > 0 && parts.length < 2) parts.push(`${minutesRest} min`);
  return parts.length > 0 ? parts.join(" e ") : "menos de 1 minuto";
};

const contarAcessosUltimos10MesesHelper = (
  usuario: Usuario,
  portasSelecionadas: string[]
) => {
  if (!usuario?.acessos) return 0;
  const dezMesesAtras = new Date();
  dezMesesAtras.setMonth(dezMesesAtras.getMonth() - 10);
  let acessos = usuario.acessos.filter(
    (a) => new Date(a.data_acesso) >= dezMesesAtras && a.ent_sai === "1"
  );
  if (portasSelecionadas.length > 0 && !portasSelecionadas.includes("todas")) {
    acessos = acessos.filter((a) => portasSelecionadas.includes(a.desc_area));
  }
  return acessos.length;
};

export default function CalculadorNaoExpirados({
  users,
  usuarios,
  treinamentos,
  portasSelecionadas,
}: Props) {
  const [page, setPage] = useState(0);
  const [sortFieldPouco, setSortFieldPouco] = useState<SortFieldPouco>("nome");
  const [sortAscPouco, setSortAscPouco] = useState(true);
  const [sortFieldMuito, setSortFieldMuito] = useState<SortFieldMuito>("nome");
  const [sortAscMuito, setSortAscMuito] = useState(true);
  const rowsPerPage = 15;

  const usersMap = useMemo(() => {
    return Object.fromEntries(users.map((u) => [u.id, u]));
  }, [users]);

  const usuariosMap = useMemo(() => {
    return Object.fromEntries(usuarios.map((u) => [Number(u.user_auth_id), u]));
  }, [usuarios]);

  const dadosTabelaPoucoAcesso = useMemo<RowPoucoAcesso[]>(() => {
    const hoje = new Date();

    return treinamentos
      .filter((t) => {
        if (!t.expiration_date) return false;
        const dataExp = new Date(t.expiration_date);
        return dataExp >= hoje;
      })
      .map((t) => {
        const user = usersMap[Number(t.user_id)];
        const usuarioAcesso = usuariosMap[Number(t.user_id)];
        const acessosUltimos10Meses = usuarioAcesso
          ? contarAcessosUltimos10MesesHelper(usuarioAcesso, portasSelecionadas)
          : 0;

        if (acessosUltimos10Meses >= 10) return null;

        const ultimoAcessoDate = usuarioAcesso
          ? getUltimoAcessoHelper(usuarioAcesso, portasSelecionadas)
          : null;
        const tempoSemEntrarRaw = ultimoAcessoDate
          ? new Date().getTime() - ultimoAcessoDate.getTime()
          : Number.POSITIVE_INFINITY;

        return {
          nome: user ? getNomeHelper(user) : "Usuário não encontrado",
          dataExp: new Date(t.expiration_date).toLocaleDateString("pt-BR"),
          dataExpRaw: new Date(t.expiration_date),
          ultimoAcesso: ultimoAcessoDate
            ? ultimoAcessoDate.toLocaleString("pt-BR")
            : "Sem acesso",
          ultimoAcessoRaw: ultimoAcessoDate,
          tempoSemEntrar: formatTempoSemEntrarHelper(ultimoAcessoDate),
          tempoSemEntrarRaw,
          acessos: usuarioAcesso
            ? contarAcessosHelper(usuarioAcesso, t.expiration_date, portasSelecionadas)
            : 0,
          acessosUltimos10Meses,
        };
      })
      .filter((item): item is RowPoucoAcesso => item !== null);
  }, [treinamentos, usersMap, usuariosMap, portasSelecionadas]);

  const dadosTabelaPoucoAcessoOrdenado = useMemo(() => {
    return [...dadosTabelaPoucoAcesso].sort((a, b) => {
      if (sortFieldPouco === "nome") {
        return sortAscPouco
          ? a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" })
          : b.nome.localeCompare(a.nome, "pt", { sensitivity: "base" });
      }
      if (sortFieldPouco === "dataExp") {
        return sortAscPouco
          ? a.dataExpRaw.getTime() - b.dataExpRaw.getTime()
          : b.dataExpRaw.getTime() - a.dataExpRaw.getTime();
      }
      if (sortFieldPouco === "ultimoAcesso") {
        const aTime = a.ultimoAcessoRaw ? a.ultimoAcessoRaw.getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.ultimoAcessoRaw ? b.ultimoAcessoRaw.getTime() : Number.POSITIVE_INFINITY;
        return sortAscPouco ? aTime - bTime : bTime - aTime;
      }
      if (sortFieldPouco === "tempoSemEntrar") {
        return sortAscPouco
          ? a.tempoSemEntrarRaw - b.tempoSemEntrarRaw
          : b.tempoSemEntrarRaw - a.tempoSemEntrarRaw;
      }
      if (sortFieldPouco === "acessos") {
        return sortAscPouco ? a.acessos - b.acessos : b.acessos - a.acessos;
      }
      return sortAscPouco
        ? a.acessosUltimos10Meses - b.acessosUltimos10Meses
        : b.acessosUltimos10Meses - a.acessosUltimos10Meses;
    });
  }, [dadosTabelaPoucoAcesso, sortFieldPouco, sortAscPouco]);

  const dadosTabelaMuitoAcesso = useMemo<RowMuitoAcesso[]>(() => {
    const hoje = new Date();

    const usuariosComTreinamentosValidos = new Set(
      treinamentos
        .filter((t) => {
          if (!t.expiration_date) return false;
          const dataExp = new Date(t.expiration_date);
          return dataExp >= hoje;
        })
        .map((t) => Number(t.user_id))
    );

    return usuarios
      .filter((usuario) => usuariosComTreinamentosValidos.has(Number(usuario.user_auth_id)))
      .map((usuario) => {
        const user = usersMap[Number(usuario.user_auth_id)];
        const acessosUltimos10Meses = contarAcessosUltimos10MesesHelper(usuario, portasSelecionadas);

        if (acessosUltimos10Meses < 10) return null;

        const ultimoAcessoDate = getUltimoAcessoHelper(usuario, portasSelecionadas);
        const tempoSemEntrarRaw = ultimoAcessoDate
          ? new Date().getTime() - ultimoAcessoDate.getTime()
          : Number.POSITIVE_INFINITY;

        return {
          nome: user ? getNomeHelper(user) : "Usuário não encontrado",
          ultimoAcesso: ultimoAcessoDate
            ? ultimoAcessoDate.toLocaleString("pt-BR")
            : "Sem acesso",
          ultimoAcessoRaw: ultimoAcessoDate,
          tempoSemEntrar: formatTempoSemEntrarHelper(ultimoAcessoDate),
          tempoSemEntrarRaw,
          acessosUltimos10Meses,
        };
      })
      .filter((item): item is RowMuitoAcesso => item !== null);
  }, [usuarios, usersMap, portasSelecionadas, treinamentos]);

  const dadosTabelaMuitoAcessoOrdenado = useMemo(() => {
    return [...dadosTabelaMuitoAcesso].sort((a, b) => {
      if (sortFieldMuito === "nome") {
        return sortAscMuito
          ? a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" })
          : b.nome.localeCompare(a.nome, "pt", { sensitivity: "base" });
      }
      if (sortFieldMuito === "ultimoAcesso") {
        const aTime = a.ultimoAcessoRaw ? a.ultimoAcessoRaw.getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.ultimoAcessoRaw ? b.ultimoAcessoRaw.getTime() : Number.POSITIVE_INFINITY;
        return sortAscMuito ? aTime - bTime : bTime - aTime;
      }
      return sortAscMuito
        ? a.tempoSemEntrarRaw - b.tempoSemEntrarRaw
        : b.tempoSemEntrarRaw - a.tempoSemEntrarRaw;
    });
  }, [dadosTabelaMuitoAcesso, sortFieldMuito, sortAscMuito]);

  const paginaVisivelPoucoAcesso = dadosTabelaPoucoAcessoOrdenado.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPaginasPoucoAcesso = Math.ceil(dadosTabelaPoucoAcessoOrdenado.length / rowsPerPage);

  const paginaVisivelMuitoAcesso = dadosTabelaMuitoAcessoOrdenado.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPaginasMuitoAcesso = Math.ceil(dadosTabelaMuitoAcessoOrdenado.length / rowsPerPage);

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

  const visiblePagesPoucoAcesso = getVisiblePages(page, totalPaginasPoucoAcesso);
  const visiblePagesMuitoAcesso = getVisiblePages(page, totalPaginasMuitoAcesso);

  useEffect(() => {
    setPage(0);
  }, [dadosTabelaPoucoAcesso, dadosTabelaMuitoAcesso]);

  return (
    <div>
      <div className="mb-5 py-4">
        <h4 className="mb-3">Usuários com Pouco Acesso</h4>
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
                            if (sortFieldPouco === "nome") {
                              setSortAscPouco((prev) => !prev);
                            } else {
                              setSortFieldPouco("nome");
                              setSortAscPouco(true);
                            }
                            setPage(0);
                          }}
                        >
                          Usuário {sortFieldPouco === "nome" ? (sortAscPouco ? "▲" : "▼") : ""}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (sortFieldPouco === "dataExp") {
                              setSortAscPouco((prev) => !prev);
                            } else {
                              setSortFieldPouco("dataExp");
                              setSortAscPouco(false);
                            }
                            setPage(0);
                          }}
                        >
                          Data de Expiração {sortFieldPouco === "dataExp" ? (sortAscPouco ? "▲" : "▼") : ""}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (sortFieldPouco === "ultimoAcesso") {
                              setSortAscPouco((prev) => !prev);
                            } else {
                              setSortFieldPouco("ultimoAcesso");
                              setSortAscPouco(false);
                            }
                            setPage(0);
                          }}
                        >
                          Último acesso {sortFieldPouco === "ultimoAcesso" ? (sortAscPouco ? "▲" : "▼") : ""}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (sortFieldPouco === "tempoSemEntrar") {
                              setSortAscPouco((prev) => !prev);
                            } else {
                              setSortFieldPouco("tempoSemEntrar");
                              setSortAscPouco(false);
                            }
                            setPage(0);
                          }}
                        >
                          Tempo sem entrar {sortFieldPouco === "tempoSemEntrar" ? (sortAscPouco ? "▲" : "▼") : ""}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (sortFieldPouco === "acessos") {
                              setSortAscPouco((prev) => !prev);
                            } else {
                              setSortFieldPouco("acessos");
                              setSortAscPouco(false);
                            }
                            setPage(0);
                          }}
                        >
                          Acessos antes da expiração {sortFieldPouco === "acessos" ? (sortAscPouco ? "▲" : "▼") : ""}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (sortFieldPouco === "acessosUltimos10Meses") {
                              setSortAscPouco((prev) => !prev);
                            } else {
                              setSortFieldPouco("acessosUltimos10Meses");
                              setSortAscPouco(false);
                            }
                            setPage(0);
                          }}
                        >
                          Acessos últimos 10 meses {sortFieldPouco === "acessosUltimos10Meses" ? (sortAscPouco ? "▲" : "▼") : ""}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosTabelaPoucoAcesso.length === 0 ? (
                        <tr>
                          <td colSpan={6}>Nenhum resultado encontrado.</td>
                        </tr>
                      ) : (
                        paginaVisivelPoucoAcesso.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td>{item!.nome}</td>
                            <td>{item!.dataExp}</td>
                            <td>{item!.ultimoAcesso}</td>
                            <td>{item!.tempoSemEntrar}</td>
                            <td>{item!.acessos}</td>
                            <td>{item!.acessosUltimos10Meses}</td>
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
                  Mostrando {dadosTabelaPoucoAcesso.length === 0 ? 0 : page * rowsPerPage + 1} a{" "}
                  {Math.min((page + 1) * rowsPerPage, dadosTabelaPoucoAcesso.length)} de{" "}
                  {dadosTabelaPoucoAcesso.length} registros
                </div>
              </div>

              <div className="col-sm-12 col-md-7 d-flex justify-content-md-end justify-content-start">
                <div style={{ maxWidth: "90%", overflowX: "auto" }}>
                  <div className="dataTables_paginate paging_simple_numbers">
                    <ul className="pagination flex-wrap">
                      <li className={`paginate_button page-item ${page === 0 && "disabled"}`}>
                        <button className="page-link" onClick={() => setPage(page - 1)}>Anterior</button>
                      </li>

                      {visiblePagesPoucoAcesso.map((item: number | string, idx: number) => {
                        if (item === '...') {
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

                      <li className={`paginate_button page-item ${page === totalPaginasPoucoAcesso - 1 && "disabled"}`}>
                        <button className="page-link" onClick={() => setPage(page + 1)}>Próximo</button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3">Usuários com Muito Acesso</h4>
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
                            if (sortFieldMuito === "nome") {
                              setSortAscMuito((prev) => !prev);
                            } else {
                              setSortFieldMuito("nome");
                              setSortAscMuito(true);
                            }
                            setPage(0);
                          }}> Usuário {sortFieldMuito === "nome" ? (sortAscMuito ? "▲" : "▼") : ""}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (sortFieldMuito === "ultimoAcesso") {
                              setSortAscMuito((prev) => !prev);
                            } else {
                              setSortFieldMuito("ultimoAcesso");
                              setSortAscMuito(false);
                            }
                            setPage(0);
                          }}> Último acesso {sortFieldMuito === "ultimoAcesso" ? (sortAscMuito ? "▲" : "▼") : ""}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (sortFieldMuito === "tempoSemEntrar") {
                              setSortAscMuito((prev) => !prev);
                            } else {
                              setSortFieldMuito("tempoSemEntrar");
                              setSortAscMuito(false);
                            }
                            setPage(0);
                          }}> Tempo sem entrar {sortFieldMuito === "tempoSemEntrar" ? (sortAscMuito ? "▲" : "▼") : ""}
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (sortFieldMuito === "acessosUltimos10Meses") {
                              setSortAscMuito((prev) => !prev);
                            } else {
                              setSortFieldMuito("acessosUltimos10Meses");
                              setSortAscMuito(false);
                            }
                            setPage(0);
                          }}> Acessos últimos 10 meses {sortFieldMuito === "acessosUltimos10Meses" ? (sortAscMuito ? "▲" : "▼") : ""}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosTabelaMuitoAcesso.length === 0 ? (
                        <tr>
                          <td colSpan={4}>Nenhum resultado encontrado.</td>
                        </tr>
                      ) : (
                        paginaVisivelMuitoAcesso.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td>{item!.nome}</td>
                            <td>{item!.ultimoAcesso}</td>
                            <td>{item!.tempoSemEntrar}</td>
                            <td>{item!.acessosUltimos10Meses}</td>
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
                  Mostrando {dadosTabelaMuitoAcesso.length === 0 ? 0 : page * rowsPerPage + 1} a{" "}
                  {Math.min((page + 1) * rowsPerPage, dadosTabelaMuitoAcesso.length)} de{" "}
                  {dadosTabelaMuitoAcesso.length} registros
                </div>
              </div>

              <div className="col-sm-12 col-md-7 d-flex justify-content-md-end justify-content-start">
                <div style={{ maxWidth: "90%", overflowX: "auto" }}>
                  <div className="dataTables_paginate paging_simple_numbers">
                    <ul className="pagination flex-wrap">
                      <li className={`paginate_button page-item ${page === 0 && "disabled"}`}>
                        <button className="page-link" onClick={() => setPage(page - 1)}>Anterior</button>
                      </li>

                      {visiblePagesMuitoAcesso.map((item: number | string, idx: number) => {
                        if (item === '...') {
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

                      <li className={`paginate_button page-item ${page === totalPaginasMuitoAcesso - 1 && "disabled"}`}>
                        <button className="page-link" onClick={() => setPage(page + 1)}>Próximo</button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
