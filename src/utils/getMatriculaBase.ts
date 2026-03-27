export function getMatriculaBase(matricula: any) {
  const m = String(matricula);

  if (!m || m.length <= 3) return m;

  return m.slice(3);
}