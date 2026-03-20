import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import { calcularTempoUsuario } from "../../utils/calcularTempoUsuario";
import { mediaHorasMinutos } from "../../utils/mediaHorasMinutos";
import { minutosParaHoras } from "../../utils/horasMinutos";
import { getNomeUsuario } from "../../utils/getNomeUsuario";
import type { Relatorio } from "../../types/Relatorio";

interface CalculadorLabProps {
  usuarios: any[];
}

export default function CalculadorLab({ usuarios = [] }: CalculadorLabProps) {
  const [relatorio, setRelatorio] = useState<Relatorio[]>([]);
  const [totalSistema, setTotalSistema] = useState("0h 0min");
  const [contagemUsuario, setContagemUsuario] = useState(0);
  const [mediaTempo, setMediaTempo] = useState("0h 0min");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const paginaVisivel = relatorio.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const PORTA_LAB = "CCS_LAB";

  useEffect(() => {
    const resultado: Relatorio[] = [];
    let contadorUsuarios = 0;
    let totalGeral = 0;

    usuarios.forEach((user) => {
      const totalUsuario = calcularTempoUsuario(user, PORTA_LAB, null, null);

      if (totalUsuario > 0) {
        contadorUsuarios++;
        totalGeral += totalUsuario;
        const { horas, minutos } = minutosParaHoras(totalUsuario);
        resultado.push({
          usuario: getNomeUsuario(user.matricula, usuarios),
          tempoTotal: `${horas}h ${minutos}min`
        });
      }
    });

    const media = mediaHorasMinutos(totalGeral, contadorUsuarios);
    const total = minutosParaHoras(totalGeral);

    setMediaTempo(`${media.horas}h ${media.minutos}min`);
    setRelatorio(resultado);
    setTotalSistema(`${total.horas}h ${total.minutos}min`);
    setContagemUsuario(contadorUsuarios);

  }, [usuarios]);

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
        style={{ color: "#f5f5f5" }}
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
        <strong>Total de usuários:</strong> {contagemUsuario}
        <br />
        <strong>Total geral de permanência:</strong> {totalSistema}
        <br />
        <strong>Média de permanência:</strong> {mediaTempo}
      </div>
    </div>
  );
}