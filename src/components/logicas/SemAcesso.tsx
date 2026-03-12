import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const paginaVisivel = semAcesso.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const PORTA_LAB = "CCS_LAB";

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

  return (
    <div style={{ padding: 20 }}>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: "#f5f5f5" }}>
            <TableCell>Usuário</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {semAcesso.length === 0 ? (
            <TableRow>
              <TableCell>
                Todos os usuários acessaram o laboratório.
              </TableCell>
            </TableRow>
          ) : (
            paginaVisivel.map((u, i) => (
              <TableRow key={i} style={{ backgroundColor: "#bdbdbd" }}>
                <TableCell>{u.usuario}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        style={{color: "#f5f5f5"}}
        component="div"
        count={semAcesso.length}
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
        <br />
        <strong>Total de usuários:</strong> {contagemUsuario}
      </div>
    </div>
  );
}