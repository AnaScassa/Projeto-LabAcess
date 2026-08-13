export function mediaHorasMinutos(
  totalMinutos: number,
  totalUsuarios: number
) {
    
  const mediaMinutos = totalUsuarios > 0 ? Math.floor(totalMinutos / totalUsuarios): 0;
  const horas = Math.floor(mediaMinutos / 60);
  const minutos = mediaMinutos % 60;

  return { horas, minutos };
}