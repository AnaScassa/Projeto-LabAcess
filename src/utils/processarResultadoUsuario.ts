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
    const { horas, minutos } = minutosParaHoras(totalUsuario);

    resultado.push({
      usuario: getNomeUsuario(user.matricula, usuarios),
      tempoTotal: `${horas}h ${minutos}min`
    });
  }
  return contadorUsuarios;
}