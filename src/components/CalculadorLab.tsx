import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";

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

  const paginaVisivel = relatorio.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const PORTA_LAB = "CCS_LAB";

  function calcularMinutos(entrada: Date, saida: Date) {
    return Math.floor((saida.getTime() - entrada.getTime()) / 60000);
  }

  function getNomeUsuario(matricula: string) {
    const u = usuarios.find((x) => x.matricula === matricula);
    if (!u) return matricula;
    return u.nome_usuario || u.nome || u.nomeUsuario || "Usuário desconhecido";
  }

  useEffect(() => {

    const resultado: Relatorio[] = [];
    let contadorUsuarios = 0;
    let totalGeral = 0;

    usuarios.forEach((user) => {

      let acessos = [...(user.acessos || [])];

      // filtra apenas CCS_LAB
      acessos = acessos.filter((a: any) => a.desc_area === PORTA_LAB);

      // filtro de tempo
      if (tempoInicio || tempoFim) {
        acessos = acessos.filter((a: any) => {
          const data = new Date(a.data_acesso);

          if (tempoInicio && data < tempoInicio) return false;
          if (tempoFim && data > tempoFim) return false;

          return true;
        });
      }

      const ordenado = [...acessos].sort(
        (a: any, b: any) =>
          new Date(a.data_acesso).getTime() -
          new Date(b.data_acesso).getTime()
      );

      const stacks: Record<string, Date | null> = {};
      let totalUsuario = 0;

      ordenado.forEach((acesso: any) => {

        const tipo = acesso.ent_sai === "1" ? "ENTRADA" : "SAIDA";
        const dataHora = new Date(acesso.data_acesso);
        const area = acesso.desc_area;

        if (!(area in stacks)) stacks[area] = null;

        const stack = stacks[area];

        if (tipo === "ENTRADA") {
          stacks[area] = dataHora;
        }

        if (tipo === "SAIDA") {
          if (stack) {

            const minutos = calcularMinutos(stack, dataHora);

            if (minutos <= 600) {
              totalUsuario += minutos;
              totalGeral += minutos;
            }

            stacks[area] = null;
          }
        }

      });

      const horas = Math.floor(totalUsuario / 60);
      const minutos = totalUsuario % 60;

      if (totalUsuario > 0) {
        contadorUsuarios++;        
        resultado.push({
          usuario: getNomeUsuario(user.matricula),
          tempoTotal: `${horas}h ${minutos}min`
        });
      }

      const mediaMinutos = contadorUsuarios > 0 
      ? Math.floor(totalGeral / contadorUsuarios)
      : 0;

      const mediaHoras = Math.floor(mediaMinutos / 60);
      const mediaMin = mediaMinutos % 60;

      setMediaTempo(`${mediaHoras}h ${mediaMin}min`);

    });

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
          labelDisplayedRows = {({ from, to, count, page }) => `Página: ${page} ${from}-${to} de ${count}`}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          showFirstButton = {true}
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