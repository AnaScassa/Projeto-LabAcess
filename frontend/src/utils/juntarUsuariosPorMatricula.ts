import { getMatriculaBase } from "./getMatriculaBase.ts";

export function juntarUsuariosPorMatricula(usuarioAtual: any, todosUsuarios: any[]) {
  const base = getMatriculaBase(usuarioAtual.matricula);

  const usuariosRelacionados = todosUsuarios.filter((u) => {
    const baseU = getMatriculaBase(u.matricula);

    return baseU === base;
  });

  let acessos: any[] = [];

  usuariosRelacionados.forEach((u) => {
    acessos = acessos.concat(u.acessos || []);
  });

  return {
    ...usuarioAtual,
    acessos
  };
}