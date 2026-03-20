import { useState, useMemo } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";

import type { Users } from "../../types/Users";
import type { Usuario } from "../../types/Usuario";
import type { Treinamento } from "../../types/Treinamento";

interface Props {
  users: Users[];
  usuarios: Usuario[];
  treinamentos: Treinamento[];
  portasSelecionadas: string[];
}

export default function CalculadorNaoExpirados({
  users,
  usuarios,
  treinamentos,
  portasSelecionadas,
}: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getNome = (u: Users) => {
    if (u.full_name?.trim()) return u.full_name;

    const nomeCompleto = `${u.first_name} ${u.last_name}`.trim();
    if (nomeCompleto) return nomeCompleto;

    return u.username;
  };

  const usersMap = useMemo(() => {
    return Object.fromEntries(users.map((u) => [u.id, u]));
  }, [users]);

  const usuariosMap = useMemo(() => {
    return Object.fromEntries(usuarios.map((u) => [Number(u.user_auth_id), u]));
  }, [usuarios]);

  const contarAcessos = (
    usuario: Usuario,
    dataExp: string,
    portasSelecionadas: string[]
  ) => {
    if (!usuario?.acessos) return 0;

    const dataExpiracao = new Date(dataExp);

    let acessos = usuario.acessos.filter(
      (a) => new Date(a.data_acesso) <= dataExpiracao && a.ent_sai === "1"
    );

    if (portasSelecionadas.length > 0 && !portasSelecionadas.includes("todas")) {
      acessos = acessos.filter((a) => portasSelecionadas.includes(a.desc_area));
    }

    return acessos.length;
  };

  const getUltimoAcesso = (usuario: Usuario, portasSelecionadas: string[]) => {
    if (!usuario?.acessos?.length) return null;

    let acessos = usuario.acessos.filter((a) => a.ent_sai === "1");

    if (portasSelecionadas.length > 0 && !portasSelecionadas.includes("todas")) {
      acessos = acessos.filter((a) => portasSelecionadas.includes(a.desc_area));
    }

    const ultimo = acessos
      .map((a) => new Date(a.data_acesso))
      .filter((dt) => !Number.isNaN(dt.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return ultimo || null;
  };

  const formatTempoSemEntrar = (ultimoAcesso: Date | null) => {
    if (!ultimoAcesso) return "Sem acessos";

    const agora = new Date();
    const diffMs = agora.getTime() - ultimoAcesso.getTime();
    if (diffMs <= 0) return "agora";

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const parts: string[] = [];
    if (diffDays > 0) parts.push(`${diffDays} dia${diffDays === 1 ? "" : "s"}`);
    const hoursRest = diffHours % 24;
    if (hoursRest > 0) parts.push(`${hoursRest} hora${hoursRest === 1 ? "" : "s"}`);
    const minutesRest = diffMinutes % 60;
    if (minutesRest > 0 && parts.length < 2) parts.push(`${minutesRest} min`);

    return parts.length > 0 ? parts.join(" e ") : "menos de 1 minuto";
  };

  const dadosTabela = useMemo(() => {
    const hoje = new Date();

    return treinamentos
      .filter((t) => {
        if (!t.expiration_date) return false;

        const dataExp = new Date(t.expiration_date);
        return dataExp >= hoje;
      })
      .map((t) => {
        const user = usersMap[Number(t.user_id)];
        const usuarioAcesso = usuariosMap[Number(t.user_id)];

        const ultimoAcessoDate = usuarioAcesso
          ? getUltimoAcesso(usuarioAcesso, portasSelecionadas)
          : null;

        return {
          nome: user ? getNome(user) : "Usuário não encontrado",
          dataExp: new Date(t.expiration_date).toLocaleDateString("pt-BR"),
          ultimoAcesso: ultimoAcessoDate
            ? ultimoAcessoDate.toLocaleString("pt-BR")
            : "Sem acesso",
          tempoSemEntrar: formatTempoSemEntrar(ultimoAcessoDate),
          acessos: usuarioAcesso
            ? contarAcessos(usuarioAcesso, t.expiration_date, portasSelecionadas)
            : 0,
        };
      });
  }, [treinamentos, usersMap, usuariosMap, portasSelecionadas]);

  const paginaVisivel = dadosTabela.slice(
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
            <TableCell>Último acesso</TableCell>
            <TableCell>Tempo sem entrar</TableCell>
            <TableCell>Acessos antes da expiração</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginaVisivel.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>Nenhum resultado encontrado.</TableCell>
            </TableRow>
          ) : (
            paginaVisivel.map((item, i) => (
              <TableRow key={i} style={{ backgroundColor: "#bdbdbd" }}>
                <TableCell>{item.nome}</TableCell>
                <TableCell>{item.dataExp}</TableCell>
                <TableCell>{item.ultimoAcesso}</TableCell>
                <TableCell>{item.tempoSemEntrar}</TableCell>
                <TableCell>{item.acessos}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        style={{ color: "#f5f5f5" }}
        component="div"
        count={dadosTabela.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </div>
  );
}
