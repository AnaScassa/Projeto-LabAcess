export function filtrarPorData(
  acessos: any[],
  tempoInicio: Date | null,
  tempoFim: Date | null
) {
  if (!tempoInicio && !tempoFim) return acessos;

  return acessos.filter((a: any) => {
    const data = new Date(a.data_acesso);

    if (tempoInicio && data < tempoInicio) return false;
    if (tempoFim && data > tempoFim) return false;

    return true;
  });
}