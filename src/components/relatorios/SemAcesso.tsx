import { useEffect, useState } from "react";
import { calcularTempoUsuario } from "../../utils/calcularTempoUsuario";
import { getNomeUsuario } from "../../utils/getNomeUsuario";

interface SemAcessoProps {
  usuarios: any[];
  tempoInicio: Date | null;
  tempoFim: Date | null;
}

interface UsuarioSemAcesso {
  usuario: string;
}

export default function SemAcesso({
  usuarios = [],
  tempoInicio,
  tempoFim
}: SemAcessoProps) {

  const [semAcesso, setSemAcesso] = useState<UsuarioSemAcesso[]>([]);
  const [contagemUsuario, setContagemUsuario] = useState(0);
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;

  const paginaVisivel = semAcesso.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const PORTA_LAB = "CCS_LAB";
  const totalPaginas = Math.ceil(semAcesso.length / rowsPerPage);

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
    const semAcessoLista: UsuarioSemAcesso[] = [];
    let contadorUsuarios = 0;

    usuarios.forEach((user) => {
      const totalUsuario = calcularTempoUsuario(user, PORTA_LAB, tempoInicio, tempoFim);

      if (totalUsuario === 0) {
        contadorUsuarios++;
        semAcessoLista.push({
          usuario: getNomeUsuario(user.matricula, usuarios)
        });
      }
    });

    setSemAcesso(semAcessoLista);
    setContagemUsuario(contadorUsuarios);
  }, [usuarios, tempoInicio, tempoFim]);

  useEffect(() => {
    setPage(0);
  }, [semAcesso]);

  return (
    <div className="card-body">
      <div className="dataTables_wrapper dt-bootstrap4">
        <div className="row">
          <div className="col-sm-12">
            <table className="table table-bordered table-hover dataTable text-left">
              <thead>
                <tr>
                  <th>Usuário</th>
                </tr>
              </thead>

              <tbody>
                {semAcesso.length === 0 ? (
                  <tr>
                    <td colSpan={1}>Todos os usuários acessaram o laboratório.</td>
                  </tr>
                ) : (
                  paginaVisivel.map((u, i) => (
                    <tr key={i}>
                      <td>{u.usuario}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-md-5">
            <div className="dataTables_info text-left">
              Mostrando {semAcesso.length === 0 ? 0 : page * rowsPerPage + 1} a{" "}
              {Math.min((page + 1) * rowsPerPage, semAcesso.length)} de{" "}
              {semAcesso.length} registros
            </div>
          </div>

          <div className="col-sm-12 col-md-7">
            <div className="dataTables_paginate paging_simple_numbers float-right">
              <ul className="pagination">

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

        <div className="mt-3 text-left">
          <p className="mb-1">
            <strong>Total de usuários:</strong> {contagemUsuario}
          </p>
        </div>
      </div>
    </div>
  );
}