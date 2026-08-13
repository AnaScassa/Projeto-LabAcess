import { minutosParaHoras } from "./horasMinutos";
import { getNomeUsuario } from "./getNomeUsuario";

export function processarResultadoUsuario(
  totalUsuario: number,
  user: any,
  usuarios: any[],
  resultado: any[],
  contadorUsuarios: number
) {
  if (totalUsuario > 0) {
    contadorUsuarios++;
    const { horas2, minutos2 } = minutosParaHoras(totalUsuario);

    resultado.push({
      usuario: getNomeUsuario(user.matricula, usuarios),
      tempoTotal: `${horas2}h ${minutos2}min`
    });
  }
  return contadorUsuarios;
}