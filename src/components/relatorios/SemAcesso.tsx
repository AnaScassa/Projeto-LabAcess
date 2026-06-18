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

  const [semAcesso, setSemAcesso] = useState<UsuarioSemAcesso[]>([]);
  const [contagemUsuario, setContagemUsuario] = useState(0);
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;
  const PORTA_LAB = "CCS_LAB";
  const [sortAsc, setSortAsc] = useState(true);

  const semAcessoOrdenado = useMemo(() => {
    return [...semAcesso].sort((a, b) => {
      return sortAsc ? a.usuario.localeCompare(b.usuario, "pt", { sensitivity: "base" }) : b.usuario.localeCompare(a.usuario, "pt", { sensitivity: "base" });
    });
  }, [semAcesso, sortAsc]);

  useEffect(() => {
    setPage(0);
  }, [semAcessoOrdenado]);

  const paginaVisivel = semAcessoOrdenado.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPaginas = Math.ceil(semAcessoOrdenado.length / rowsPerPage);

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
    const semAcessoLista: UsuarioSemAcesso[] = [];
    let contadorUsuarios = 0;

    const usuariosMap: Record<string, any> = {};

    usuariosFiltrados.forEach((u) => {
      const base = getMatriculaBase(u.matricula);

      if (!usuariosMap[base]) {
        usuariosMap[base] = u;
      }
    });

    const usuariosUnicos = Object.values(usuariosMap);

    usuariosUnicos.forEach((user: any) => {
      const totalUsuario = calcularTempoUsuario(user, PORTA_LAB, tempoInicio, tempoFim);

      if (totalUsuario === 0) {
        contadorUsuarios++;
        semAcessoLista.push({
          usuario: user.nome_usuario
        });
      }
    });

    setSemAcesso(semAcessoLista);
    setContagemUsuario(contadorUsuarios);
  },[usuarios, tempoInicio, tempoFim, categoriasSelecionadas]);

  useEffect(() => {
    setPage(0);
  }, [semAcesso]);

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
                  </tr>
                </thead>

                <tbody>
                  {semAcesso.length === 0 ? (
                    <tr>
                      <td colSpan={1}>Todos os usuários acessaram o laboratório.</td>
                    </tr>
                  ) : (paginaVisivel.map((u, i) => (
                    <tr key={i}>
                      <td>{u.usuario}</td>
                    </tr>
                    )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-md-5">
            <div className="dataTables_info text-left">
              Mostrando {semAcessoOrdenado.length === 0 ? 0 : page * rowsPerPage + 1} a{" "}
              {Math.min((page + 1) * rowsPerPage, semAcessoOrdenado.length)} de{" "}
              {semAcessoOrdenado.length} registros
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
                      );}
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

        <div className="mt-3 text-left">
          <p className="mb-1">
            <strong>Total de usuários:</strong> {contagemUsuario}
          </p>
        </div>
      </div>
    </div>
  );
}