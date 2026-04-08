interface ParamsEntradaSemSaida {
  user: any;
  usuarios: any[];
  stack: Date;
  area: string;
  getNomeUsuario: (matricula: string, usuarios: any[]) => string;
}

export function entradaSemSaida({
  user,
  usuarios,
  stack,
  area,
  getNomeUsuario
}: ParamsEntradaSemSaida) {
  return {
    usuario: getNomeUsuario(user.matricula, usuarios),
    entrada: stack.toLocaleString(),
    saida: "Entrada sem saída",
    permanencia: "Indisponível",
    porta: area,
    entradaTimestamp: stack.getTime(),
    saidaTimestamp: 0
  };
}