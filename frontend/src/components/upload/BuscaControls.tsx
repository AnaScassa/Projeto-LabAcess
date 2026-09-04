type BuscaControlsProps = {
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
};

export default function BuscaControls({
  quantidadeUltimaBusca,
  dataUltimaBusca,
  buscarBloqueado,
  mensagem,
  dataInicio,
  dataFim,
  horaInicio,
  horaFim,
  onDataInicioChange,
  onDataFimChange,
  onHoraInicioChange,
  onHoraFimChange,
  onBuscaRapida,
  onBuscaAvancada,
}: BuscaControlsProps) {
  return (
    <div className="card" style={{ height: "400px" }}>
      <div className="card-header">
        <h3 className="card-title" style={{ fontWeight: 500 }}>Buscar registros</h3>
      </div>

      <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ height: "100%", gap: "20px" }}>
        <p className="mb-0 text-center" style={{ fontSize: "0.8rem" }}> Última busca finalizada: {quantidadeUltimaBusca === null ? "Nenhuma busca registrada"
            : `${quantidadeUltimaBusca} registro(s) em ${dataUltimaBusca ? new Date(dataUltimaBusca).toLocaleString("pt-BR") : "data não informada"}`}
        </p>

        <div className="d-flex flex-column align-items-center w-100" style={{ gap: "16px" }}>
          <button className="btn btn-outline-secondary" onClick={onBuscaRapida} disabled={buscarBloqueado}>
            <i className="fas fa-sync-alt me-2"></i>
            {buscarBloqueado ? mensagem : "Buscar registros dos últimos 5 minutos"}
          </button>

          <hr className="w-100 my-2" />

          <div className="busca-avancada-content w-100">
            <h6 className="mb-3 text-center">
              <i className="fas fa-search me-2"></i>
              Busca Avançada
            </h6>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Data inicial</label>
                <input type="date" className="form-control busca-input" value={dataInicio} onChange={(event) => onDataInicioChange(event.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Data final</label>
                <input type="date" className="form-control busca-input input-busca" value={dataFim} onChange={(event) => onDataFimChange(event.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Hora inicial</label>
                <input type="time" className="form-control busca-input input-busca" value={horaInicio} onChange={(event) => onHoraInicioChange(event.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Hora final</label>
                <input type="time" className="form-control busca-input input-busca" value={horaFim} onChange={(event) => onHoraFimChange(event.target.value)} />
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
      </div>
    </div>
  );
}
