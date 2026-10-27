import { useCallback, useEffect, useState } from "react";
import { buscarErrosRpa, type ErroRpa } from "../../services/errosRpa";

const INTERVALO_ERROS_MS = 15_000;

export default function ErrosRpaAdmin() {
  const [erros, setErros] = useState<ErroRpa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const carregarErros = useCallback(async () => {
    setAtualizando(true);
    try {
      setErros(await buscarErrosRpa());
      setMensagemErro(null);
    } catch (error) {
      console.error("Erro ao carregar logs de erro do RPA:", error);
      setMensagemErro("Não foi possível carregar os erros do RPA.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    void carregarErros();
    const intervalo = window.setInterval(() => void carregarErros(), INTERVALO_ERROS_MS);
    return () => window.clearInterval(intervalo);
  }, [carregarErros]);

  return (
    <section className="card border-0 border-top border-danger rounded-lg shadow-sm">
      <div className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center">
        <div className="d-flex align-items-center">
          <i className="fas fa-exclamation-triangle text-danger mr-2" aria-hidden="true"></i>
          <h6 className="font-weight-bold text-dark mb-0 mr-1">Erros do RPA</h6>
        </div>
        {!carregando && !mensagemErro && (
          <span className="badge badge-danger mr-3">{erros.length} erro(s)</span>
        )}
        <button type="button" className="btn btn-outline-secondary btn-sm ml-auto" onClick={() => void carregarErros()} disabled={atualizando}
          aria-label="Atualizar erros do RPA" title="Atualizar">
          <i className={`fas fa-sync-alt mr-0 ${atualizando ? "fa-spin" : ""}`} aria-hidden="true"></i>
        </button>
      </div>
      <div className="card-body p-0" style={{ maxHeight: "420px", overflowY: "auto" }}>
        {mensagemErro ? (
          <div className="alert alert-danger m-4" role="alert">{mensagemErro}</div>
        ) : carregando ? (
          <div className="p-4 text-secondary d-flex align-items-center justify-content-center">
            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
            Carregando erros do RPA...
          </div>
        ) : erros.length === 0 ? (
          <div className="p-4 text-secondary">Nenhum erro do RPA foi registrado.</div>
        ) : (
          <div className="list-group list-group-flush">
            {erros.map((erro) => (
              <article key={erro.id} className="list-group-item px-2 py-1">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-0">
                  <small className="font-weight-bold text-secondary">Erro #{erro.id}</small>
                  <time className="small text-muted" dateTime={erro.data}>
                    {new Date(erro.data).toLocaleString("pt-BR")}
                  </time>
                </div>
                <pre className="mb-0 text-dark" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "inherit" }}>
                  {erro.mensagem}
                </pre>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="card-footer bg-white text-muted small">
        Exibindo até os 100 erros mais recentes; atualização automática a cada 15 segundos.
      </div>
    </section>
  );
}
