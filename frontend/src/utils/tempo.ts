export function calcularMinutos(entrada: Date, saida: Date) {
  return Math.floor((saida.getTime() - entrada.getTime()) / 60000);
}