import { useCallback, useEffect, useState } from "react";
import {
  buscarErrosProcessamento,
  type ErroProcessamento,
} from "../../services/erroProcessamento";

const INTERVALO_ERROS_MS = 15_000;

export default function ErrosProcessamentoAdmin() {
  const [erros, setErros] = useState<ErroProcessamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const carregarErros = useCallback(async () => {
    setAtualizando(true);
    try {
      setErros(await buscarErrosProcessamento());
      setMensagemErro(null);
    } catch (error) {
      console.error("Erro ao carregar logs de processamento:", error);
      setMensagemErro("Não foi possível carregar os erros de processamento.");
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
          <i className="fas fa-exclamation-circle text-danger mr-2" aria-hidden="true"></i>
          <h6 className="font-weight-bold text-dark mb-0 mr-1">Erros de processamento</h6>
        </div>
        {!carregando && !mensagemErro && (
          <span className="badge badge-danger mr-3">{erros.length} erro(s)</span>
        )}
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm ml-auto"
          onClick={() => void carregarErros()}
          disabled={atualizando}
          aria-label="Atualizar erros de processamento"
          title="Atualizar"
        >
          <i className={`fas fa-sync-alt mr-0 ${atualizando ? "fa-spin" : ""}`} aria-hidden="true"></i>
        </button>
      </div>
      <div className="card-body p-0" style={{ maxHeight: "420px", overflowY: "auto" }}>
        {mensagemErro ? (
          <div className="alert alert-danger m-4" role="alert">{mensagemErro}</div>
        ) : carregando ? (
          <div className="p-4 text-secondary d-flex align-items-center justify-content-center">
            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
            Carregando erros de processamento...
          </div>
        ) : erros.length === 0 ? (
          <div className="p-4 text-secondary">Nenhum erro de processamento foi registrado.</div>
        ) : (
          <div className="list-group list-group-flush">
            {erros.map((erro) => (
              <article key={erro.id} className="list-group-item px-4 py-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                  <span className="font-weight-bold text-dark">Processamento #{erro.id}</span>
                  <span className="badge badge-danger">{erro.status}</span>
                </div>
                <div className="small text-secondary mt-2">
                  <span className="mr-3">Usuário: {erro.user ?? "Não informado"}</span>
                  <span>Tarefa: {erro.task_name || "Não informada"}</span>
                </div>
                <small className="d-block text-muted mt-2">
                  Atualizado em:{" "}
                  <time dateTime={erro.atualizado_em}>
                    {new Date(erro.atualizado_em).toLocaleString("pt-BR")}
                  </time>
                </small>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="card-footer bg-white text-muted small">
        Atualização automática a cada 15 segundos.
      </div>
    </section>
  );
}
