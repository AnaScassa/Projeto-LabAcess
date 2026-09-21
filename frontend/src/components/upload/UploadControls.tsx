import { TailSpin } from "react-loader-spinner";

type UploadControlsProps = {
    onUpload: (event: React.FormEvent<HTMLFormElement>) => void;
    estaBloqueado: boolean;
    loading: boolean;
    mensagem2: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
};

export default function UploadControls({
    onUpload,
    estaBloqueado,
    loading,
    mensagem2,
    fileInputRef,
}: UploadControlsProps) {
  return (
    <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden">

      <div className="card-header bg-white border-bottom px-4 py-3">
        <div>
          <div className="d-flex align-items-center">
            <i className="fas fa-file-upload text-primary me-2"></i>
            <h5 className="mb-0 fw-semibold text-dark">Upload de Arquivos</h5>
          </div>
          <small className="text-secondary">Envie uma planilha para processamento</small>
        </div>
      </div>

      <div className="card-body px-4 py-4">
        <form onSubmit={onUpload}>
          <div className="row g-3">
          <div className="col-12 col-md-9">
            <label htmlFor="fileInput" className="form-label small fw-semibold text-secondary mb-2">Arquivo</label>
            <input ref={fileInputRef} type="file" id="fileInput" accept=".xls,.csv" className="form-control" style={{ padding: "3px" }}/>
            <div className="form-text">Formatos aceitos: .xls e .csv</div>
          </div>
            <div className="col-12 col-md-3 d-flex align-items-center justify-content-center">
              <button className="btn btn-primary w-100" type="submit" disabled={estaBloqueado}>
                <i className={`fas ${estaBloqueado ? "fa-spinner fa-spin" : "fa-upload"} me-2`}></i>
                {estaBloqueado ? "Enviando..." : "Enviar arquivo"}
              </button>
            </div>
          </div>
        </form>

        {loading && (
          <div className="d-flex justify-content-center mt-4">
            <TailSpin height="40" width="40" color="#0d6efd"/>
          </div>
        )}
        {mensagem2 && (
          <div className="text-center mt-4">
            <span className="text-secondary small">
              {mensagem2}
            </span>
          </div>
        )}
      </div>
          
      </div>
  );
}