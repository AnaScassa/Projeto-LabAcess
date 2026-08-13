export function minutosParaHoras(minutos: number) {
  const horas2 = Math.floor(minutos / 60);
  const mins = minutos % 60;

  return {
    horas2,
    minutos2: mins
  };
}