type BuscaControlsProps = {
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

    <div className="card" style={{height: "360px", overflow: "hidden"}}>
      <div className="card-header">
        <h3 className="card-title mb-0" style={{ fontWeight: 500 }}>
          <i className="fas fa-search me-2"></i>
          Busca avançada
        </h3>
      </div>

      <div className="card-body p-3">
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label mb-1">Data inicial</label>
            <input type="date" className="form-control busca-input" value={dataInicio} onChange={(event) => onDataInicioChange(event.target.value)}/>
          </div>

          <div className="col-md-6">
            <label className="form-label mb-1">Data final</label>
            <input type="date" className="form-control busca-input input-busca" value={dataFim} onChange={(event) => onDataFimChange(event.target.value)}/>
          </div>

          <div className="col-md-6">
            <label className="form-label mb-1">Hora inicial</label>
            <input type="time" className="form-control busca-input input-busca" value={horaInicio} onChange={(event) => onHoraInicioChange(event.target.value)}/>
          </div>

          <div className="col-md-6">
            <label className="form-label mb-1">Hora final</label>
            <input type="time" className="form-control busca-input input-busca" value={horaFim} onChange={(event) => onHoraFimChange(event.target.value)}/>
          </div>
        </div>

        <div className="d-flex flex-column align-items-center mt-3">
            <button className="btn btn-outline-secondary" style={{ width: "230px" }} onClick={onBuscaAvancada} disabled={buscarBloqueado}>
                <i className="fas fa-sync-alt me-2"></i>
                {buscarBloqueado ? mensagem : "Buscar registros"}
            </button>

            <hr style={{ width: "230px", margin: "15px 0", border: "0", borderTop: "1px solid #dee2e6", opacity: 1 }} />

            <div className="d-flex align-items-center position-relative">
                <button className="btn btn-outline-secondary" style={{ width: "230px" }} onClick={onBuscaRapida} disabled={buscarBloqueado}>
                    <i className="fas fa-sync-alt me-2"></i>
                    {buscarBloqueado ? mensagem : "Buscar últimos 5 minutos"}
                </button>
                <i className="fas fa-info-circle text-muted" aria-label="O que é RPA?"
                    title="A busca automática é realizada por um robô (RPA), portanto pode haver uma demora para o retorno dos registros. "
                    style={{ cursor: "help", position: "absolute", left: "245px" }}>
                </i>
            </div>
            </div>
      </div>
    </div>
  );
}