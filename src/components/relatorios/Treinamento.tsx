import { useState, useMemo, useEffect } from "react";

import type { Users } from "../../types/Users";
import type { Usuario } from "../../types/Usuario";
import type { Treinamento } from "../../types/Treinamento";

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
  const rowsPerPage = 15;

  const usersMap = useMemo(() => {
    return Object.fromEntries(users.map((u) => [u.id, u]));
  }, [users]);

  const usuariosMap = useMemo(() => {
    return Object.fromEntries(usuarios.map((u) => [Number(u.user_auth_id), u]));
  }, [usuarios]);

  const dadosTabelaPoucoAcesso = useMemo(() => {
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

        return {
          nome: user ? getNomeHelper(user) : "Usuário não encontrado",
          dataExp: new Date(t.expiration_date).toLocaleDateString("pt-BR"),
          ultimoAcesso: ultimoAcessoDate
            ? ultimoAcessoDate.toLocaleString("pt-BR")
            : "Sem acesso",
          tempoSemEntrar: formatTempoSemEntrarHelper(ultimoAcessoDate),
          acessos: usuarioAcesso
            ? contarAcessosHelper(usuarioAcesso, t.expiration_date, portasSelecionadas)
            : 0,
          acessosUltimos10Meses,
        };
      })
      .filter(Boolean);
  }, [treinamentos, usersMap, usuariosMap, portasSelecionadas]);

  const dadosTabelaMuitoAcesso = useMemo(() => {
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

        return {
          nome: user ? getNomeHelper(user) : "Usuário não encontrado",
          ultimoAcesso: ultimoAcessoDate
            ? ultimoAcessoDate.toLocaleString("pt-BR")
            : "Sem acesso",
          tempoSemEntrar: formatTempoSemEntrarHelper(ultimoAcessoDate),
          acessosUltimos10Meses,
        };
      })
      .filter(Boolean);
  }, [usuarios, usersMap, portasSelecionadas, treinamentos]);

  const paginaVisivelPoucoAcesso = dadosTabelaPoucoAcesso.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPaginasPoucoAcesso = Math.ceil(dadosTabelaPoucoAcesso.length / rowsPerPage);

  const paginaVisivelMuitoAcesso = dadosTabelaMuitoAcesso.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPaginasMuitoAcesso = Math.ceil(dadosTabelaMuitoAcesso.length / rowsPerPage);

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
        <h4 className="mb-3">Treinamentos Não Expirados - Usuários com Pouco Acesso</h4>
        <div className="card-body">
          <div className="dataTables_wrapper dt-bootstrap4">
            <div className="row">
              <div className="col-sm-12">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover dataTable text-left">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Data de Expiração</th>
                        <th>Último acesso</th>
                        <th>Tempo sem entrar</th>
                        <th>Acessos antes da expiração</th>
                        <th>Acessos últimos 10 meses</th>
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
        <h4 className="mb-3">Usuários com Muito Acesso (10 ou mais acessos nos últimos 10 meses)</h4>
        <div className="card-body">
          <div className="dataTables_wrapper dt-bootstrap4">
            <div className="row">
              <div className="col-sm-12">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover dataTable text-left">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Último acesso</th>
                        <th>Tempo sem entrar</th>
                        <th>Acessos últimos 10 meses</th>
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
