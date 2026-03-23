import { useEffect, useState } from "react";
import { mediaHorasMinutos } from "../../utils/mediaHorasMinutos";
import { processarResultadoUsuario } from "../../utils/processarResultadoUsuario";
import { calcularTempoUsuario } from "../../utils/calcularTempoUsuario";
import { minutosParaHoras } from "../../utils/horasMinutos";
import type { Relatorio } from "../../types/Relatorio";

interface CalculadorLabProps {
  usuarios: any[];
  tempoInicio: Date | null;
  tempoFim: Date | null;
}

export default function CalculadorLab({
  usuarios = [],
  tempoInicio,
  tempoFim
}: CalculadorLabProps) {
    const [relatorio, setRelatorio] = useState<Relatorio[]>([]);
    const [totalSistema, setTotalSistema] = useState("0h 0min");
    const [contagemUsuario, setContagemUsuario] = useState(0);
    const [mediaTempo, setMediaTempo] = useState("0h 0min");
    const [page, setPage] = useState(0);
    const rowsPerPage = 15;

    const paginaVisivel = relatorio.slice( page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const PORTA_LAB = "CCS_LAB";
    const totalPaginas = Math.ceil(relatorio.length / rowsPerPage);

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
      const resultado: Relatorio[] = [];
      let contadorUsuarios = 0;
      let totalGeral = 0;

      usuarios.forEach((user) => {
        const totalUsuario = calcularTempoUsuario(user, PORTA_LAB, tempoInicio, tempoFim);
        if (totalUsuario > 0) {
          totalGeral += totalUsuario;
        }
        contadorUsuarios = processarResultadoUsuario(totalUsuario, user, usuarios, resultado, contadorUsuarios);
      });

      const { horas, minutos } = mediaHorasMinutos(totalGeral, contadorUsuarios);
      const { horas2, minutos2 } = minutosParaHoras(totalGeral);

      setMediaTempo(`${horas}h ${minutos}min`);
      setRelatorio(resultado);
      setTotalSistema(`${horas2}h ${minutos2}min`);
      setContagemUsuario(contadorUsuarios);

  }, [usuarios, tempoInicio, tempoFim]);

  useEffect(() => {
    setPage(0);
  }, [relatorio]);

  return (
    <div className="card-body">
      <div className="dataTables_wrapper dt-bootstrap4">

        <div className="row">
          <div className="col-sm-12">
            <table className="table table-bordered table-hover dataTable text-left">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Tempo total</th>
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

        <div className="row">
          <div className="col-sm-12 col-md-5">
            <div className="dataTables_info text-left">
              Mostrando {relatorio.length === 0 ? 0 : page * rowsPerPage + 1} a{" "}
              {Math.min((page + 1) * rowsPerPage, relatorio.length)} de{" "}
              {relatorio.length} registros
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

        <div className="mt-3 text-left">
          <p className="mb-1">
            <strong>Total geral de permanência:</strong> {totalSistema}
          </p>
          <p className="mb-1">
            <strong>Total de usuários:</strong> {contagemUsuario}
          </p>
          <p className="mb-0">
            <strong>Média de permanência:</strong> {mediaTempo}
          </p>
        </div>
      </div>
    </div>
  );
}