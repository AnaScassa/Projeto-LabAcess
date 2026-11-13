import { Fragment, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip, type TooltipItem } from "chart.js";
import Menu from "../components/style/Menu";
import { carregarAcessos } from "../services/acessos";
import type { Acesso } from "../services/acessos";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TODOS_DIAS_SEMANA = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
const DIAS_UTEIS = TODOS_DIAS_SEMANA.slice(0, 5);
const HORAS_EXIBIDAS = Array.from({ length: 14 }, (_, indice) => indice + 6);
const CATEGORIA_SEM_CADASTRO = "__sem_categoria__";
const CATEGORIA_ALUNO_NUMERICA = "__aluno_numerico__";
const CORES_CALOR = ["#e5efff", "#b8d5ff", "#78b5f8", "#3b91e5", "#0d6efd"];

function formatarDataLocal(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function lerDataLocal(valor: string, fimDoDia = false) {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia, fimDoDia ? 23 : 0, fimDoDia ? 59 : 0, fimDoDia ? 59 : 0, fimDoDia ? 999 : 0);
}

function obterDiaSemana(data: Date) {
  return (data.getDay() + 6) % 7;
}

function obterChaveCategoria(categoria: string | null) {
  const valor = categoria?.trim();
  if (!valor) return CATEGORIA_SEM_CADASTRO;
  return Number.isFinite(Number(valor)) ? CATEGORIA_ALUNO_NUMERICA : valor;
}

function formatarCategoria(categoria: string) {
  if (categoria === CATEGORIA_SEM_CADASTRO) return "Sem categoria";
  if (categoria === CATEGORIA_ALUNO_NUMERICA) return "Aluno";
  return categoria;
}

function obterAcessosValidos(acessos: Acesso[]) {
  const idsVistos = new Set<number>();
  return acessos.filter((acesso) => {
    if (idsVistos.has(acesso.id)) return false;
    idsVistos.add(acesso.id);
    return acesso.ent_sai === "1" && acesso.data_acesso !== null && !Number.isNaN(new Date(acesso.data_acesso).getTime());
  });
}

export default function AnaliseUtilizacao() {
  const agora = new Date();
  const hoje = formatarDataLocal(agora);
  const primeiroDiaDoMes = formatarDataLocal(new Date(agora.getFullYear(), agora.getMonth(), 1));
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMes);
  const [dataFim, setDataFim] = useState(hoje);
  const [areaSelecionada, setAreaSelecionada] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro(null);

      try {
        const resultado = await carregarAcessos();
        if (ativo) setAcessos(resultado);
      } catch (error) {
        console.error("Erro ao carregar dados da análise de utilização:", error);
        if (ativo) setErro("Não foi possível carregar os registros de acesso. Tente novamente.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarDados();
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const acessosValidos = useMemo(() => obterAcessosValidos(acessos), [acessos]);
  const areas = useMemo(() => [...new Set(acessosValidos.map((acesso) => acesso.desc_area).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" })), [acessosValidos],
  );
  const categorias = useMemo(() => {
    const categoriasPorChave = new Map<string, string>();
    acessosValidos.forEach((acesso) => {
      const chave = obterChaveCategoria(acesso.categoriaUsuario);
      categoriasPorChave.set(chave, formatarCategoria(chave));
    });
    return [...categoriasPorChave.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }));
  }, [acessosValidos]);

  const periodoInvalido = Boolean(dataInicio && dataFim && dataInicio > dataFim);

  const acessosFiltrados = useMemo(() => {
    if (periodoInvalido) return [];

    const inicio = dataInicio ? lerDataLocal(dataInicio) : null;
    const fim = dataFim ? lerDataLocal(dataFim, true) : null;

    return acessosValidos.filter((acesso) => {
      const data = new Date(acesso.data_acesso!);
      if (inicio && data < inicio) return false;
      if (fim && data > fim) return false;
      if (areaSelecionada && acesso.desc_area !== areaSelecionada) return false;
      if (categoriaSelecionada && obterChaveCategoria(acesso.categoriaUsuario) !== categoriaSelecionada) return false;
      return true;
    });
  }, [acessosValidos, areaSelecionada, categoriaSelecionada, dataFim, dataInicio, periodoInvalido]);

  const indicadores = useMemo(() => {
    const acessosPorDia = Array.from({ length: 7 }, () => 0);
    const acessosPorHora = Array.from({ length: 24 }, () => 0);
    const mapaCalor = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    const acessosPorArea = new Map<string, number>();

    acessosFiltrados.forEach((acesso) => {
      const data = new Date(acesso.data_acesso!);
      const dia = obterDiaSemana(data);
      const hora = data.getHours();
      acessosPorDia[dia] += 1;
      acessosPorHora[hora] += 1;
      mapaCalor[dia][hora] += 1;
      acessosPorArea.set(acesso.desc_area, (acessosPorArea.get(acesso.desc_area) ?? 0) + 1);
    });

    const diaMaisMovimentado = acessosPorDia.reduce<number | null>(
      (maior, quantidade, indice) => quantidade > 0 && (maior === null || quantidade > acessosPorDia[maior]) ? indice : maior,
      null,
    );
    const horarioDePico = acessosPorHora.reduce<number | null>(
      (maior, quantidade, indice) => quantidade > 0 && (maior === null || quantidade > acessosPorHora[maior]) ? indice : maior,
      null,
    );
    const areasOrdenadas = [...acessosPorArea.entries()].sort(
      ([nomeA, quantidadeA], [nomeB, quantidadeB]) => quantidadeB - quantidadeA || nomeA.localeCompare(nomeB, "pt-BR"),
    );

    return {acessosPorDia, acessosPorHora, mapaCalor, areasOrdenadas, diaMaisMovimentado, horarioDePico, maximoCalor: Math.max(...mapaCalor.flatMap((linha) => linha.slice(6, 20)))};
  }, [acessosFiltrados]);

  const dadosGraficoDias = {
    labels: DIAS_UTEIS,
    datasets: [{label: "Acessos", data: indicadores.acessosPorDia.slice(0, 5), backgroundColor: "#17a2b8", borderRadius: 5}],
  };
  const opcoesGraficoDias = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context: TooltipItem<"bar">) => `${context.parsed.y ?? 0} acessos` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div className="wrapper">
      <Menu />
      <div className="content-wrapper">
        <div className="px-4 pt-3 pb-2">
          <div className="icon-dashboard d-flex align-items-center">
            <i className="fas fa-chart-line text-primary me-2" style={{ fontSize: "35px" }}></i>
            <h2 className="mb-0 fw-semibold text-dark">Análise de Utilização</h2>
          </div>
          <small className="text-secondary">Estatísticas de utilização e movimentação do laboratório</small>
        </div>

        <section className="content px-4 pt-2 pb-4">
          <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">
            <div className="card-header bg-white border-bottom px-4 py-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-filter text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Filtros de consulta</h5>
              </div>
              <small className="text-secondary">Filtre os indicadores por período, área e categoria de usuário</small>
            </div>
            <div className="card-body px-4 py-4">
              <div className="row g-3">
                <div className="col-12 col-md-6 col-xl-3">
                  <label htmlFor="analise-data-inicio" className="form-label mb-1 fw-semibold text-secondary">Data inicial</label>
                  <input id="analise-data-inicio" type="date" className="form-control" max={hoje}
                    value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} />
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                  <label htmlFor="analise-data-fim" className="form-label mb-1 fw-semibold text-secondary">Data final</label>
                  <input id="analise-data-fim" type="date" className="form-control" max={hoje}
                    value={dataFim} onChange={(event) => setDataFim(event.target.value)} />
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                  <label htmlFor="analise-area" className="form-label mb-1 fw-semibold text-secondary">Área do laboratório</label>
                  <select id="analise-area" className="form-control" value={areaSelecionada}
                    onChange={(event) => setAreaSelecionada(event.target.value)}>
                    <option value="">Todas as áreas</option>
                    {areas.map((area) => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                  <label htmlFor="analise-categoria" className="form-label mb-1 fw-semibold text-secondary">Categoria do usuário</label>
                  <select id="analise-categoria" className="form-control" value={categoriaSelecionada}
                    onChange={(event) => setCategoriaSelecionada(event.target.value)}>
                    <option value="">Todas as categorias</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.value} value={categoria.value}>{categoria.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {periodoInvalido && (
                <div className="alert alert-warning mt-3 mb-0" role="alert">
                  A data inicial não pode ser posterior à data final.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="content px-4 pb-4">
          {carregando ? (
            <div className="card border-0 rounded-3 shadow-sm">
              <div className="card-body text-center text-secondary py-5" role="status">Carregando dados de utilização...</div>
            </div>
          ) : erro ? (
            <div className="alert alert-danger d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3" role="alert">
              <span>{erro}</span>
              <button type="button" className="btn btn-outline-danger align-self-start align-self-sm-center"
                onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</button>
            </div>
          ) : (
            <>
              {acessosFiltrados.length === 0 && !periodoInvalido && (
                <div className="alert alert-light border text-secondary" role="status">
                  Nenhum registro de entrada encontrado para os filtros selecionados.
                </div>
              )}

              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card border-0 border-top border-primary rounded-3 shadow-sm h-100">
                    <div className="card-body">
                      <small className="text-secondary d-block mb-1">Total de acessos</small>
                      <span className="fs-4 fw-semibold text-dark">{acessosFiltrados.length.toLocaleString("pt-BR")}</span>
                      <small className="text-secondary d-block">Registros de entrada</small>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card border-0 border-top border-info rounded-3 shadow-sm h-100">
                    <div className="card-body">
                      <small className="text-secondary d-block mb-1">Dia mais movimentado</small>
                      <span className="fs-5 fw-semibold text-dark">
                        {indicadores.diaMaisMovimentado === null ? "—" : TODOS_DIAS_SEMANA[indicadores.diaMaisMovimentado]}
                      </span>
                      <small className="text-secondary d-block">
                        {indicadores.diaMaisMovimentado === null ? "Sem dados" : `${indicadores.acessosPorDia[indicadores.diaMaisMovimentado].toLocaleString("pt-BR")} acessos`}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card border-0 border-top border-warning rounded-3 shadow-sm h-100">
                    <div className="card-body">
                      <small className="text-secondary d-block mb-1">Horário de pico</small>
                      <span className="fs-5 fw-semibold text-dark">
                        {indicadores.horarioDePico === null ? "—" : `${String(indicadores.horarioDePico).padStart(2, "0")}:00–${String(indicadores.horarioDePico).padStart(2, "0")}:59`}
                      </span>
                      <small className="text-secondary d-block">
                        {indicadores.horarioDePico === null ? "Sem dados" : `${indicadores.acessosPorHora[indicadores.horarioDePico].toLocaleString("pt-BR")} acessos`}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card border-0 border-top border-success rounded-3 shadow-sm h-100">
                    <div className="card-body">
                      <small className="text-secondary d-block mb-1">Área mais utilizada</small>
                      <span className="fs-5 fw-semibold text-dark">{indicadores.areasOrdenadas[0]?.[0] ?? "—"}</span>
                      <small className="text-secondary d-block">
                        {indicadores.areasOrdenadas[0] ? `${indicadores.areasOrdenadas[0][1].toLocaleString("pt-BR")} acessos` : "Sem dados"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div className="card border-0 border-top border-primary rounded-3 shadow-sm h-100">
                    <div className="card-header bg-white border-bottom px-4 py-3">
                      <h5 className="mb-0 fw-semibold text-dark">Acessos por dia da semana</h5>
                      <small className="text-secondary">Quantidade de registros de entrada em cada dia</small>
                    </div>
                    <div className="card-body" style={{ height: "290px" }}>
                      <Bar data={dadosGraficoDias} options={opcoesGraficoDias} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div className="card border-0 border-top border-primary rounded-3 shadow-sm h-100">
                    <div className="card-header bg-white border-bottom px-4 py-3">
                      <h5 className="mb-0 fw-semibold text-dark">Mapa de calor de utilização</h5>
                      <small className="text-secondary">Entradas por dia e hora; passe sobre um quadrado para ver a contagem</small>
                    </div>
                    <div className="card-body py-3">
                      <div className="w-100">
                        <div style={{display: "grid", gridTemplateColumns: "38px repeat(14, minmax(0, 1fr))", columnGap: "2px", rowGap: "4px", width: "100%"}}>
                          <span />
                          {HORAS_EXIBIDAS.map((hora) => (
                            <span key={hora} className="text-center text-secondary" title={`${String(hora).padStart(2, "0")}:00`} 
                              aria-label={`${String(hora).padStart(2, "0")}:00`} style={{ fontSize: "8px", lineHeight: "14px", minWidth: 0, whiteSpace: "nowrap" }}> 
                                {String(hora).padStart(2, "0")}h
                            </span>
                          ))}
                          {DIAS_UTEIS.map((dia, indiceDia) => (
                            <Fragment key={dia}>
                              <span className="text-secondary" title={`${dia}: ${indicadores.acessosPorDia[indiceDia]} acessos`} style={{ fontSize: "10px", lineHeight: "15px" }}>
                                {dia.slice(0, 3)}
                              </span>
                              {HORAS_EXIBIDAS.map((hora) => {
                                const quantidade = indicadores.mapaCalor[indiceDia][hora];
                                const intensidade = quantidade === 0 || indicadores.maximoCalor === 0 ? 0
                                  : Math.min(4, Math.ceil(Math.log1p(quantidade) / Math.log1p(indicadores.maximoCalor) * 4));
                                return (
                                  <span key={`${dia}-${hora}`} title={`${dia}, ${String(hora).padStart(2, "0")}:00–${String(hora).padStart(2, "0")}:59: ${quantidade} acessos`}
                                    aria-label={`${dia}, ${hora} horas: ${quantidade} acessos`}
                                    style={{display: "block", minWidth: 0, height: "22px", borderRadius: "2px", 
                                      backgroundColor: CORES_CALOR[intensidade], outline: "1px solid rgba(27, 31, 35, 0.04)",
                                    }}
                                  />
                                );
                              })}
                            </Fragment>
                          ))}
                        </div>
                        <div className="d-flex align-items-center justify-content-end gap-1 mt-2 text-secondary" aria-label="Legenda de intensidade">
                          <small className="mr-1" style={{ fontSize: "10px" }}>Menos</small>
                          {CORES_CALOR.map((cor) => (
                            <span key={cor} className="mr-1"
                              style={{width: "10px", height: "10px", borderRadius: "2px", backgroundColor: cor, outline: "1px solid rgba(27, 31, 35, 0.04)"}}
                            />
                          ))}
                          <small style={{ fontSize: "10px" }}>Mais</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
