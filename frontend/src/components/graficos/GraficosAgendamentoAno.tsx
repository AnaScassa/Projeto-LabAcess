import { useEffect, useState } from "react";
import { carregarAcessos, type Acesso } from "../../services/acessos";
import AcessosAgendadosAno from "./AcessosAgendadosAno";
import AcessosNaoAgendadosAno from "./AcessosNaoAgendadosAno";

const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface ContagensMensais {
  agendados: number[];
  naoAgendados: number[];
}

function obterAnosDisponiveis(acessos: Acesso[]): number[] {
  return [...new Set(acessos.flatMap((acesso) => {
    if (!acesso.data_acesso) return [];
    const dataAcesso = new Date(acesso.data_acesso);
    return Number.isNaN(dataAcesso.getTime()) ? [] : [dataAcesso.getFullYear()];
  }), )].sort((a, b) => b - a);
}

function contarEntradasPorMes(acessos: Acesso[], ano: number): ContagensMensais {
  const contagens: ContagensMensais = {
    agendados: Array(12).fill(0),
    naoAgendados: Array(12).fill(0),
  };

  acessos.forEach((acesso) => {
    if (!acesso.data_acesso) return;
    const dataAcesso = new Date(acesso.data_acesso);
    if (Number.isNaN(dataAcesso.getTime()) || dataAcesso.getFullYear() !== ano) return;

    const contagem = acesso.eh_agendado ? contagens.agendados : contagens.naoAgendados;
    contagem[dataAcesso.getMonth()] += 1;
  });

  return contagens;
}

export default function GraficosAgendamentoAno() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acessos, setAcessos] = useState<Acesso[] | null>(null);
  const [anoAgendados, setAnoAgendados] = useState<number | null>(null);
  const [anoNaoAgendados, setAnoNaoAgendados] = useState<number | null>(null);
  const anosDisponiveis = acessos ? obterAnosDisponiveis(acessos) : [];

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const dados = await carregarAcessos();
        if (ativo) {
          setAcessos(dados);
          const anos = obterAnosDisponiveis(dados);
          const anoAtual = new Date().getFullYear();
          const anoInicial = anos.includes(anoAtual) ? anoAtual : (anos[0] ?? null);
          setAnoAgendados(anoInicial);
          setAnoNaoAgendados(anoInicial);
        }
      } catch (err) {
        console.error("Erro ao carregar gráficos de acessos agendados:", err);
        if (ativo) setError("Não foi possível carregar os gráficos de acessos.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarDados();
    return () => {
      ativo = false;
    };
  }, []);

  const contagensAgendados = acessos && anoAgendados !== null ? contarEntradasPorMes(acessos, anoAgendados) : null;
  const contagensNaoAgendados = acessos && anoNaoAgendados !== null ? contarEntradasPorMes(acessos, anoNaoAgendados) : null;
  const escalaMaxima = Math.max(1, ...(contagensAgendados?.agendados ?? []), ...(contagensNaoAgendados?.naoAgendados ?? []));
  const labels = nomesMeses;

  return (
    <div className="row w-100 mx-0">
      <div className="col-12 col-xl-6 mb-4 px-2">
        <div className="card border-0 rounded-lg shadow-sm h-100 overflow-hidden">
          <div className="card-header bg-white border-bottom px-3 py-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap">
              <div className="d-flex align-items-center mr-2 mb-2 mb-sm-0">
                <div className="d-flex align-items-center justify-content-center mr-3 flex-shrink-0" style={{ width: "42px", height: "42px", backgroundColor: "rgba(40, 167, 69, 0.12)", borderRadius: "8px" }}>
                  <i className="fas fa-calendar-check mr-0" style={{ color: "#28a745", fontSize: "18px" }}></i>
                </div>
                <div>
                  <h6 className="font-weight-bold text-dark mb-2">Acessos agendados - {anoAgendados}</h6>
                  <small className="text-muted">Distribuição mensal</small>
                </div>
              </div>
              <select className="form-control form-control-sm" style={{ width: "100px", height: "38px" }} value={anoAgendados ?? ""}
                onChange={(e) => setAnoAgendados(Number(e.target.value))} disabled={loading || anosDisponiveis.length === 0} aria-label="Ano dos acessos agendados"
              >
                {anosDisponiveis.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="card-body p-3" style={{ height: "400px" }}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <span className="spinner-border" style={{ color: "#28a745" }} role="status"></span>
              </div>
            ) : error ? (
              <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
                <i className="fas fa-exclamation-circle text-danger mb-2" style={{ fontSize: "28px" }}></i>
                <span className="text-danger small">{error}</span>
              </div>
            ) : !contagensAgendados ? (
              <div className="d-flex justify-content-center align-items-center h-100 text-muted text-center">
                Não há acessos com data válida para exibir.
              </div>
            ) : (
              <AcessosAgendadosAno labels={labels} valores={contagensAgendados.agendados} escalaMaxima={escalaMaxima}/>
            )}
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-6 mb-4 px-2">
        <div className="card border-0 rounded-lg shadow-sm h-100 overflow-hidden">
          <div className="card-header bg-white border-bottom px-3 py-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap">
              <div className="d-flex align-items-center mr-2 mb-2 mb-sm-0">
                <div className="d-flex align-items-center justify-content-center mr-3 flex-shrink-0" style={{ width: "42px", height: "42px", backgroundColor: "rgba(220, 53, 69, 0.12)", borderRadius: "8px" }}>
                  <i className="fas fa-calendar-times mr-0" style={{ color: "#dc3545", fontSize: "18px" }}></i>
                </div>
                <div>
                  <h6 className="font-weight-bold text-dark mb-2">Acessos não agendados - {anoNaoAgendados}</h6>
                  <small className="text-muted">Distribuição mensal</small>
                </div>
              </div>
              <select className="form-control form-control-sm" style={{ width: "100px", height: "38px" }} value={anoNaoAgendados ?? ""}
                onChange={(e) => setAnoNaoAgendados(Number(e.target.value))} disabled={loading || anosDisponiveis.length === 0} aria-label="Ano dos acessos não agendados"
              >
                {anosDisponiveis.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="card-body p-3" style={{ height: "400px" }}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <span className="spinner-border" style={{ color: "#dc3545" }} role="status"></span>
              </div>
            ) : error ? (
              <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
                <i className="fas fa-exclamation-circle text-danger mb-2" style={{ fontSize: "28px" }}></i>
                <span className="text-danger small">{error}</span>
              </div>
            ) : !contagensNaoAgendados ? (
              <div className="d-flex justify-content-center align-items-center h-100 text-muted text-center">
                Não há acessos com data válida para exibir.
              </div>
            ) : (
              <AcessosNaoAgendadosAno labels={labels} valores={contagensNaoAgendados.naoAgendados} escalaMaxima={escalaMaxima}/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
