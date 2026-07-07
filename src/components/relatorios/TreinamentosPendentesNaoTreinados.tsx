import { useState, useMemo, useEffect } from "react";
import type { Usuario } from "../../types/Usuario";
import type { Treinamento } from "../../types/Treinamento";
import type { Users } from "../../types/Users";

interface Props {
  users: Users[];
  usuarios: Usuario[];
  treinamentos: Treinamento[];
}

export default function UsuariosSemTreinamento({
  users,
  usuarios,
  treinamentos,
}: Props) {

const [page, setPage] = useState(0);
const [sortAsc, setSortAsc] = useState(true);

const rowsPerPage = 15;

const usuariosMap = useMemo(() => {
  return Object.fromEntries(usuarios.map((u) => [String(u.user_auth_id), u]));
}, [usuarios]);

const usuariosComTreinamento = useMemo(() => {
  return new Set(treinamentos.map((t) => String(t.user_id)));
}, [treinamentos]);

const isAluno = (categoria: string) => {
  return !isNaN(Number(categoria));
};

const usuariosSemTreinamento = useMemo(() => {
  const lista = users.filter((user) => {
    const usuarioRelacionado = usuariosMap[String(user.id)];

    if (!usuarioRelacionado) return false;
    if (!isAluno(usuarioRelacionado.categoriaUsuario)) return false;
    if (usuariosComTreinamento.has(String(user.id))) return false;

      return true;
    }).map((user) => {
      const usuarioRelacionado = usuariosMap[String(user.id)];

      const acessos = usuarioRelacionado.acessos ?? [];

      const ultimoAcesso = acessos.length > 0 ? acessos.reduce((maisRecente, atual) => 
        new Date(atual.data_acesso) > new Date(maisRecente.data_acesso) ? atual : maisRecente).data_acesso : null;

      return {
        nome: user.full_name, totalAcessos: acessos.length, ultimoAcesso,
      };
    });

  return lista.sort((a, b) => sortAsc ? a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" }) : b.nome.localeCompare(a.nome, "pt", { sensitivity: "base" }));
}, [users, usuariosMap, usuariosComTreinamento, sortAsc]);

const paginaVisivel = usuariosSemTreinamento.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
const totalPaginas = Math.ceil(usuariosSemTreinamento.length / rowsPerPage);

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
}, [usuariosSemTreinamento]);

  return (
    <div className="card-body">
      <div className="dataTables_wrapper dt-bootstrap4">
        <div className="row">
          <div className="col-sm-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover dataTable text-left">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => {setSortAsc((prev) => !prev); setPage(0);}}>
                      Usuário {sortAsc ? "▲" : "▼"}
                    </th>
                    <th>
                      Total de Acessos
                    </th>
                    <th>
                      Último Acesso
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginaVisivel.length === 0 ? (
                    <tr>
                      <td>Todos os usuários possuem treinamento.</td>
                    </tr>
                  ) : (
                    paginaVisivel.map((user) => (
                      <tr key={user.nome}>
                        <td>{user.nome}</td>
                        <td>{user.totalAcessos}</td>
                        <td>{user.ultimoAcesso ? new Date(user.ultimoAcesso).toLocaleString("pt-BR") : "-"}</td>
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
              Mostrando{" "} {usuariosSemTreinamento.length === 0 ? 0 : page * rowsPerPage + 1}{" "}a{" "}
              {Math.min((page + 1) * rowsPerPage, usuariosSemTreinamento.length)}{" "} de {usuariosSemTreinamento.length} registros
            </div>
          </div>

          <div className="col-sm-12 col-md-7 d-flex justify-content-md-end justify-content-start">
            <div style={{ maxWidth: "90%", overflowX: "auto" }}>
              <div className="dataTables_paginate paging_simple_numbers">
                <ul className="pagination flex-wrap">
                  <li className={`paginate_button page-item ${page === 0 && "disabled"}`}>
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