import { useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";

import type { Usuario } from "../../types/Usuario";
import type { Treinamento } from "../../types/Treinamento";

interface CalculadorTreinamentoProps {
  usuarios: Usuario[];
  treinamentos: Treinamento[];
}

export default function CalculadorTreinamento({
  usuarios,
  treinamentos
}: CalculadorTreinamentoProps) {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginaVisivel = treinamentos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div>
      <Table style={{ padding: 20 }}>
        <TableHead>
          <TableRow style={{ backgroundColor: "#f5f5f5" }}>
            <TableCell>Usuário</TableCell>
            <TableCell>Data de Expiração</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginaVisivel.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2}>
                Nenhum resultado encontrado.
              </TableCell>
            </TableRow>
          ) : (
            paginaVisivel.map((t, index) => {
              const usuario = usuarios.find(
                u => String(u.matricula) === String(t.user_id)
              );

              return (
                <TableRow key={index} style={{ backgroundColor: "#bdbdbd" }}>
                  <TableCell>
                    {usuario ? usuario.nome_usuario : "Usuário não encontrado"}
                  </TableCell>

                  <TableCell>
                    {t.expiration_date
                      ? new Date(t.expiration_date).toLocaleDateString("pt-BR")
                      : "Sem data"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={treinamentos.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </div>
  );
}