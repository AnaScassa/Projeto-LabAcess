import { TailSpin } from "react-loader-spinner";

type UploadControlsProps = {
  onUpload: (event: React.FormEvent<HTMLFormElement>) => void;
  estaBloqueado: boolean;
  loading: boolean;
  mensagem2: string;
  quantidadeUltimaBusca: number | null;
  dataUltimaBusca: string | null;
  buscarBloqueado: boolean;
  mensagem: string;
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  onDataInicioChange: (value: string) => void;
  onDataFimChange: (value: string) => void;
  onHoraInicioChange: (value: string) => void;
  onHoraFimChange: (value: string) => void;
  onBuscaRapida: () => void;
  onBuscaAvancada: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
};

export default function UploadControls({onUpload, estaBloqueado, loading, mensagem2, quantidadeUltimaBusca, dataUltimaBusca, buscarBloqueado, mensagem,
  dataInicio, dataFim, horaInicio, horaFim, onDataInicioChange, onDataFimChange, onHoraInicioChange, onHoraFimChange, onBuscaRapida, onBuscaAvancada,
    fileInputRef,
}: UploadControlsProps) {
  return (
    <div className="card" style={{ height: "400px" }}>
      <div className="card-header">
        <h3 className="card-title" style={{ fontWeight: 500 }}>Upload de Arquivos</h3>
      </div>

      <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ height: "100%", gap: "20px" }}>
        <form onSubmit={onUpload}>
          <div className="d-flex flex-column" style={{ gap: "30px" }}>
              <input ref={fileInputRef} type="file" id="fileInput" accept=".xls,.csv" />

            <div className="d-flex flex-column align-items-center" style={{ width: "100%" }}>
              <button className="btn btn-primary" type="submit" disabled={estaBloqueado} style={{ minWidth: "130px" }}>
                {estaBloqueado ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </form>

        {loading && (
          <div className="mt-3">
            <TailSpin height="50" width="50" color="#007bff" />
          </div>
        )}

        {mensagem2 && <p className="mt-3 mb-0">{mensagem2}</p>}
      </div>

      <div className="card-footer footer-busca d-flex flex-column">
        <p className="mb-0 text-center" style={{ fontSize: "0.8rem" }}>
          Última busca finalizada: {quantidadeUltimaBusca === null ? "Nenhuma busca registrada" : `${quantidadeUltimaBusca} registro(s) em ${dataUltimaBusca ? new Date(dataUltimaBusca).toLocaleString("pt-BR") : "data não informada"}`}
        </p>
        <div className="d-flex flex-row align-items-center" style={{ gap: "10px" }}>
          <button className="btn btn-outline-secondary" onClick={onBuscaRapida} disabled={buscarBloqueado}>
            <i className="fas fa-sync-alt me-2"></i>
            {buscarBloqueado ? mensagem : "Buscar registros dos últimos 5 minutos"}
          </button>

          <details className="details-custom">
            <summary className="btn btn-outline-secondary btn-sm">
              <div className="d-flex align-items-center justify-content-center w-100">
                <i className="fas fa-chevron-down"></i>
              </div>
            </summary>

            <div className="details-content card shadow-sm mt-3">
              <div className="card-body">
                <h6 className="mb-3 text-center">
                  <i className="fas fa-search me-2"></i>
                  Busca Avançada
                </h6>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Data inicial</label>
                    <input type="date" className="form-control" value={dataInicio} onChange={(event) => onDataInicioChange(event.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Data final</label>
                    <input type="date" className="form-control" value={dataFim} onChange={(event) => onDataFimChange(event.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Hora inicial</label>
                    <input type="time" className="form-control" value={horaInicio} onChange={(event) => onHoraInicioChange(event.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Hora final</label>
                    <input type="time" className="form-control" value={horaFim} onChange={(event) => onHoraFimChange(event.target.value)} />
                  </div>
                </div>

                <hr />

                <div className="text-center">
                  <button className="btn btn-outline-secondary" onClick={onBuscaAvancada} disabled={buscarBloqueado}>
                    <i className="fas fa-sync-alt me-2"></i>
                    {buscarBloqueado ? mensagem : "Buscar registros"}
                  </button>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
