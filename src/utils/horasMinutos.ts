export function minutosParaHoras(minutos: number) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  return {
    horas,
    minutos: mins
  };
}