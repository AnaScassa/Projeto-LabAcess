import { useState, useMemo, useEffect } from "react";
import type { Users } from "../../types/Users";
import type { Usuario } from "../../types/Usuario";
import type { Treinamento } from "../../types/Treinamento";

import { getUserFullName } from "../../utils/getUserFullName";

type TreinamentoExpiradoRow = {
  nome: string;
  dataExp: string;
  dataExpRaw: Date;
  acessos: number;
};

interface Props {
  users: Users[];
  usuarios: Usuario[];
  treinamentos: Treinamento[];
  portasSelecionadas: string[];
}

export default function RelatorioTreinamento({
  users,
  usuarios,
  treinamentos,
  portasSelecionadas
}: Props) {

  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<"nome" | "dataExp" | "acessos">("nome");
  const [sortAsc, setSortAsc] = useState(true);
  const rowsPerPage = 15;

  const usersMap = useMemo(() => {
    return Object.fromEntries(users.map(u => [u.id, u]));
  }, [users]);

  const usuariosMap = useMemo(() => {
    return Object.fromEntries(usuarios.map(u => [Number(u.user_auth_id), u]));
  }, [usuarios]);

  const contarAcessos = (usuario: Usuario, dataExp: string, portasSelecionadas: string[]) => {
    if (!usuario?.acessos) return 0;

    const dataExpiracao = new Date(dataExp);

    let acessos = usuario.acessos.filter(a => new Date(a.data_acesso) > dataExpiracao && a.ent_sai === "1");

    if (portasSelecionadas.length > 0 && !portasSelecionadas.includes("todas")) {
      acessos = acessos.filter(a => portasSelecionadas.includes(a.desc_area));
    }
    return acessos.length;

};

  const dadosTabela = useMemo<TreinamentoExpiradoRow[]>(() => {
  const hoje = new Date();

  return treinamentos
    .filter(t => {
      if (!t.expiration_date) return false;

      const dataExp = new Date(t.expiration_date);
      return dataExp < hoje;
    })
    .map(t => {
      const user = usersMap[Number(t.user_id)];
      const usuarioAcesso = usuariosMap[Number(t.user_id)];

      if (!usuarioAcesso?.acessos || usuarioAcesso.acessos.length === 0) {
        return null;
      }

      const dataExpRaw = new Date(t.expiration_date);
      return {
        nome: user ? getUserFullName(user) : "Usuário não encontrado",
        dataExp: dataExpRaw.toLocaleDateString("pt-BR"),
        dataExpRaw,
        acessos: contarAcessos(usuarioAcesso, t.expiration_date, portasSelecionadas)
      };
    })
    .filter((item): item is TreinamentoExpiradoRow => item !== null)
    .sort((a, b) => {
      if (sortField === "nome") {
        return sortAsc
          ? a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" })
          : b.nome.localeCompare(a.nome, "pt", { sensitivity: "base" });
      }

      if (sortField === "dataExp") {
        return sortAsc
          ? a.dataExpRaw.getTime() - b.dataExpRaw.getTime()
          : b.dataExpRaw.getTime() - a.dataExpRaw.getTime();
      }

      return sortAsc ? a.acessos - b.acessos : b.acessos - a.acessos;
    });
}, [treinamentos, usersMap, usuariosMap, portasSelecionadas, sortAsc, sortField]);

  const paginaVisivel = dadosTabela.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPaginas = Math.ceil(dadosTabela.length / rowsPerPage);

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
  }, [dadosTabela]);

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
                        if (sortField === "nome") {
                          setSortAsc((prev) => !prev);
                        } else {
                          setSortField("nome");
                          setSortAsc(true);
                        }
                        setPage(0);
                      }}
                    >
                      Usuário {sortField === "nome" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sortField === "dataExp") {
                          setSortAsc((prev) => !prev);
                        } else {
                          setSortField("dataExp");
                          setSortAsc(false);
                        }
                        setPage(0);
                      }}
                    >
                      Data de Expiração {sortField === "dataExp" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sortField === "acessos") {
                          setSortAsc((prev) => !prev);
                        } else {
                          setSortField("acessos");
                          setSortAsc(false);
                        }
                        setPage(0);
                      }}
                    >
                      Acessos após expiração {sortField === "acessos" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dadosTabela.length === 0 ? (
                    <tr>
                      <td colSpan={3}>Nenhum resultado encontrado.</td>
                    </tr>
                  ) : (
                    paginaVisivel.map((item, i) => (
                      <tr key={i}>
                        <td>{item.nome}</td>
                        <td>{item.dataExp}</td>
                        <td>{item.acessos}</td>
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
              Mostrando {dadosTabela.length === 0 ? 0 : page * rowsPerPage + 1} a{" "}
              {Math.min((page + 1) * rowsPerPage, dadosTabela.length)} de{" "}
              {dadosTabela.length} registros
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
                      <li key={idx} className={`paginate_button page-item ${page === pageNum ? "active" : ""}`}>
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
      </div>
    </div>
  );
}