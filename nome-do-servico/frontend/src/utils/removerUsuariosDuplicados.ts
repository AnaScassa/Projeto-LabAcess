import { getMatriculaBase } from "./getMatriculaBase";

export function removerUsuariosDuplicados(usuarios: any[]) {
  const mapa: Record<string, any> = {};

  usuarios.forEach((u) => {
    const base = getMatriculaBase(u.matricula);

    if (!mapa[base]) {
      mapa[base] = u; 
    }
  });

  return Object.values(mapa);
}