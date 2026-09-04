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
    </div>
  );
}
