import type { Usuario } from "../types/Usuario";

export function getNomeUsuario(matricula: string, usuarios: Usuario[]) {
  const u = usuarios.find((x) => x.matricula === matricula);
  if (!u) return matricula;
  return u.nome_usuario || (u as any).nome || (u as any).nomeUsuario || "Usuário desconhecido";
}