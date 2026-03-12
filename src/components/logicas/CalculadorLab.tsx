import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import { mediaHorasMinutos } from "../../utils/mediaHorasMinutos";
import { processarResultadoUsuario } from "../../utils/processarResultadoUsuario";
import { calcularTempoUsuario } from "../../utils/calcularTempoUsuario";

interface CalculadorLabProps {
  usuarios: any[];
  tempoInicio: Date | null;
  tempoFim: Date | null;
}

interface Relatorio {
  usuario: string;
  tempoTotal: string;
}

export default function CalculadorLab({
  usuarios = [],
  tempoInicio,
  tempoFim
}: CalculadorLabProps) {
  const [relatorio, setRelatorio] = useState<Relatorio[]>([]);
  const [totalSistema, setTotalSistema] = useState(0);
  const [contagemUsuario, setContagemUsuario] = useState(0);
  const [mediaTempo, setMediaTempo] = useState("0h 0min");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const paginaVisivel = relatorio.slice( page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const PORTA_LAB = "CCS_LAB";

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

    setMediaTempo(`${horas}h ${minutos}min`);
    setRelatorio(resultado);
    setTotalSistema(Number((totalGeral / 60).toFixed(2)));
    setContagemUsuario(contadorUsuarios);

  }, [usuarios, tempoInicio, tempoFim]);

  return (
    <div style={{ padding: 20 }}>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: "#f5f5f5" }}>
            <TableCell>Usuário</TableCell>
            <TableCell>Tempo total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {relatorio.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2}>
                Nenhum resultado encontrado.
              </TableCell>
            </TableRow>
          ) : (
            paginaVisivel.map((r, i) => (
              <TableRow key={i} style={{ backgroundColor: "#bdbdbd" }}>
                <TableCell>{r.usuario}</TableCell>
                <TableCell>{r.tempoTotal}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        style={{color: "#f5f5f5"}}
        component="div"
        count={relatorio.length}
        labelDisplayedRows={({ from, to, count, page }) =>
          `Página: ${page} ${from}-${to} de ${count}`
        }
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        showFirstButton={true}
      />
      <div style={{ marginTop: 20, fontSize: 18 }}>
        <strong>Total geral de permanência:</strong> {totalSistema} horas
        <br />
        <strong>Total de usuários:</strong> {contagemUsuario}
        <br />
        <strong>Média de permanência:</strong> {mediaTempo}
      </div>
    </div>
  );
}