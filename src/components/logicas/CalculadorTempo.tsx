import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import { calcularMinutos } from "../../utils/tempo";
import { getNomeUsuario } from "../../utils/getNomeUsuario";
import { filtrarPorData } from "../../utils/filtroData";
import { minutosParaHoras } from "../../utils/horasMinutos";
import { mediaHorasMinutos } from "../../utils/mediaHorasMinutos";

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
  const [totalAcessos, setTotalAcessos] = useState(0);
  const [totalAcessosErro, setTotalAcessosErro] = useState(0);
  const [mediaTempo, setMediaTempo] = useState("0h 0min");
  const [totalSistema, setTotalSistema] = useState("0h 0min");

  const paginaVisivel = resultados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  function calcularPermanencia(user: any, portas: string[] = []) {
    let contagemAcessos = 0;
    let contagemErro = 0;
    let totalGeral = 0;
    let acessos = [...(user.acessos || [])];

    acessos = filtrarPorData(acessos, tempoInicio, tempoFim);

    if (portas.length > 0 && !portas.includes("todas")) {
      acessos = acessos.filter((a: any) => portas.includes(a.desc_area));
    }

    const ordenado = [...acessos].sort((a: any, b: any) => new Date(a.data_acesso).getTime() - new Date(b.data_acesso).getTime());
    const stacks: Record<string, Date | null> = {};
    const out: Resultado[] = [];

    ordenado.forEach((acesso: any) => {
      const tipo = acesso.ent_sai === "1" ? "ENTRADA" : "SAIDA";
      const dataHora = new Date(acesso.data_acesso);
      const dataHoraStr = dataHora.toLocaleString();
      const area = acesso.desc_area;

      if (!(area in stacks)) stacks[area] = null;

      const stack = stacks[area];

      if (tipo === "ENTRADA") {
        stacks[area] = dataHora;
        return;
      }

      if (tipo === "SAIDA") {
        if (stack) {
          const totalMinutos = calcularMinutos(stack, dataHora);
          if (totalMinutos <= 600) {
            const { horas, minutos } = minutosParaHoras(totalMinutos);
            contagemAcessos++;
            totalGeral += totalMinutos;

            out.push({
              usuario: getNomeUsuario(user.matricula, usuarios),
              entrada: stack.toLocaleString(),
              saida: dataHoraStr,
              permanencia: `${horas}h ${minutos}min`,
              porta: area
            });

          } else {
            
            contagemErro++;
            out.push({
              usuario: getNomeUsuario(user.matricula, usuarios),
              entrada: stack.toLocaleString(),
              saida: "Entrada sem saída",
              permanencia: "Indisponível",
              porta: area
            });
          }

          stacks[area] = null;

        } else {

          contagemErro++;
          out.push({
            usuario: getNomeUsuario(user.matricula, usuarios),
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
        contagemErro++;

        out.push({
          usuario: getNomeUsuario(user.matricula, usuarios),
          entrada: st.toLocaleString(),
          saida: "Entrada sem saída",
          permanencia: "Indisponível",
          porta: area
        });
      }
    });

    const { horas, minutos } = mediaHorasMinutos(totalGeral, contagemAcessos);
    const { horas: horas2, minutos: minutos2 } = minutosParaHoras(totalGeral)

    setMediaTempo(`${horas}h ${minutos}min`);
    setResultados(out);
    setTotalAcessos(contagemAcessos);
    setTotalAcessosErro(contagemErro);
    setTotalSistema(`${horas2}h ${minutos2}min`);
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
              <TableCell colSpan={5}>
                Nenhum resultado encontrado.
              </TableCell>
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
        labelDisplayedRows={({ from, to, count, page }) =>
          `Página: ${page} ${from}-${to} de ${count}`
        }
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5,10,20,50]}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value,10));
          setPage(0);
        }}
        showFirstButton={true}
      />
      <div>
        <strong>Total de acessos com entrada e saída:</strong> {totalAcessos}
        <br />
        <strong>Total de acessos com erro:</strong> {totalAcessosErro}
        <br />
        <strong>Total de Tempo Permanência:</strong> {totalSistema} 
        <br />
        <strong>Média de Tempo Permanência:</strong> {mediaTempo}
      </div>
    </div>
  );
}