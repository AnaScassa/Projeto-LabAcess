import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";

interface CalculadorTempoProps {
  usuario: any;
  usuarios?: any[];
  portasSelecionadas: string[];
  tempoInicio: Date | null;
  tempoFim: Date | null;
}

interface Resultado {
  usuario: string;
  entrada: string;
  saida: string;
  permanencia: string;
  porta: string;
}

export default function CalculadorTempo({
  usuario,
  usuarios = [],
  portasSelecionadas,
  tempoInicio,
  tempoFim
}: CalculadorTempoProps){

  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginaVisivel = resultados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0);
  }, [resultados]);

  useEffect(() => {
    if (!usuario) {
      setResultados([]);
      return;
    }
    calcularPermanencia(usuario, portasSelecionadas);
  }, [usuario, portasSelecionadas, usuarios, tempoInicio, tempoFim]);

  function getNomeUsuario(matricula: string) {
    const u = usuarios.find((x) => x.matricula === matricula);
    if (!u) return matricula;
    return u.nome_usuario || u.nome || u.nomeUsuario || "Usuário desconhecido";
  }

  function calcularMinutos(entrada: Date, saida: Date) {
    return Math.floor((saida.getTime() - entrada.getTime()) / 60000);
  }

  function calcularPermanencia(user: any, portas: string[] = []) {
    if (!user) {
      setResultados([]);
      return;
    }

    let acessos = [...(user.acessos || [])];

    if (tempoInicio || tempoFim) {
      acessos = acessos.filter((a: any) => {
        const data = new Date(a.data_acesso);

        if (tempoInicio && data < tempoInicio) return false;
        if (tempoFim && data > tempoFim) return false;

        return true;
      });
    }

    if (portas.length > 0 && !portas.includes("todas")) {
      acessos = acessos.filter((a: any) => portas.includes(a.desc_area));
    }

    const ordenado = [...acessos].sort(
      (a: any, b: any) =>
        new Date(a.data_acesso).getTime() -
        new Date(b.data_acesso).getTime()
    );

    const data = ordenado.filter(
      (item: any, index: number, array: any[]) => {
        if (index === 0) return true;
        if (item.desc_area !== array[index - 1].desc_area) return true;
        return item.data_acesso !== array[index - 1].data_acesso;
      }
    );

    const stacks: Record<string, Date | null> = {};
    const out: Resultado[] = [];

    data.forEach((acesso: any) => {
      const tipo = acesso.ent_sai === "1" ? "ENTRADA" : "SAIDA";
      const dataHoraObj = new Date(acesso.data_acesso);
      const dataHoraStr = dataHoraObj.toLocaleString();
      const area = acesso.desc_area;

      if (!(area in stacks)) stacks[area] = null;
      const stack = stacks[area];

      if (tipo === "ENTRADA") {
        if (stack) {
          out.push({
            usuario: getNomeUsuario(user.matricula),
            entrada: stack.toLocaleString(),
            saida: "Entrada sem saída",
            permanencia: "Indisponível",
            porta: area
          });
        }
        stacks[area] = dataHoraObj;
        return;
      }

      if (tipo === "SAIDA") {
        if (stack) {
          const minutos = calcularMinutos(stack, dataHoraObj);

          if (minutos <= 600) {
            const horas = Math.floor(minutos / 60);
            const mins = minutos % 60;
            out.push({
              usuario: getNomeUsuario(user.matricula),
              entrada: stack.toLocaleString(),
              saida: dataHoraStr,
              permanencia: `${horas}h ${mins}min`,
              porta: area
            });
          } else {
            out.push({
              usuario: getNomeUsuario(user.matricula),
              entrada: stack.toLocaleString(),
              saida: "Entrada sem saída",
              permanencia: "Indisponível",
              porta: area
            });
            out.push({
              usuario: getNomeUsuario(user.matricula),
              entrada: "Saída sem entrada",
              saida: dataHoraStr,
              permanencia: "Indisponível",
              porta: area
            });
          }
          stacks[area] = null;
        } else {
          out.push({
            usuario: getNomeUsuario(user.matricula),
            entrada: "Saída sem entrada",
            saida: dataHoraStr,
            permanencia: "Indisponível",
            porta: area
          });
        }
      }
    });

    Object.keys(stacks).forEach((area) => {
      const st = stacks[area];
      if (st) {
        out.push({
          usuario: getNomeUsuario(user.matricula),
          entrada: st.toLocaleString(),
          saida: "Entrada sem saída",
          permanencia: "Indisponível",
          porta: area
        });
      }
    });

    setResultados(out);
  }

  return (
    <div style={{ padding: 20 }}>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: "#f5f5f5" }}>
            <TableCell>Usuário</TableCell>
            <TableCell>Entrada</TableCell>
            <TableCell>Saída</TableCell>
            <TableCell>Porta</TableCell>
            <TableCell>Tempo Permanência</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginaVisivel.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>Nenhum resultado encontrado.</TableCell>
            </TableRow>
          ) : (
            paginaVisivel.map((r, i) => (
              <TableRow key={i} style={{ backgroundColor: "#bdbdbd" }}>
                <TableCell>{r.usuario}</TableCell>
                <TableCell>{r.entrada}</TableCell>
                <TableCell>{r.saida}</TableCell>
                <TableCell>{r.porta}</TableCell>
                <TableCell>{r.permanencia}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        style={{color: "#f5f5f5"}}
        component="div"
        count={resultados.length}
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
    </div>
  );
}
