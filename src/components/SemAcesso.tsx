import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";

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

    const semAcessoLista: UsuarioSemAcesso[] = [];
    let contadorUsuarios = 0;

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
            }

            stacks[area] = null;
          }
        }

      });

      if (totalUsuario === 0) {
        contadorUsuarios++;        
        semAcessoLista.push({
          usuario: getNomeUsuario(user.matricula)
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

            semAcesso.map((u, i) => (
              <TableRow key={i} style={{ backgroundColor: "#bdbdbd" }}>
                <TableCell>{u.usuario}</TableCell>
              </TableRow>
            ))

          )}

        </TableBody>
      </Table>

        <div style={{ marginTop: 20, fontSize: 18 }}>
            <br /> 
            <strong>Total de usuários:</strong> {contagemUsuario}
        </div>

    </div>
  );
}