import { calcularMinutos } from "./tempo";
import { filtrarPorData } from "./filtroData";

export function calcularTempoUsuario(
  user: any,
  porta: string,
  tempoInicio: Date | null,
  tempoFim: Date | null
) {
  let acessos = [...(user.acessos || [])];

  acessos = acessos.filter((a: any) => a.desc_area === porta);
  acessos = filtrarPorData(acessos, tempoInicio, tempoFim);

  const ordenado = [...acessos].sort(
    (a: any, b: any) =>
      new Date(a.data_acesso).getTime() -
      new Date(b.data_acesso).getTime()
  );

  const stacks: Record<string, Date | null> = {};
  let totalUsuario = 0;

  ordenado.forEach((acesso: any) => {
    const tipo = acesso.ent_sai === "1" ? "ENTRADA" : "SAIDA";
    const dataHora = new Date(acesso.data_acesso);
    const area = acesso.desc_area;

    if (!(area in stacks)) stacks[area] = null;
    const stack = stacks[area];

    if (tipo === "ENTRADA") {
      stacks[area] = dataHora;
    }

    if (tipo === "SAIDA" && stack) {
      const minutos = calcularMinutos(stack, dataHora);
      if (minutos <= 600) {
        totalUsuario += minutos;
      }
      stacks[area] = null;
    }
  });

  return totalUsuario;
}