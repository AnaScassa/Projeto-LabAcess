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
  <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">
    <div className="card-header bg-white border-bottom px-4 py-3">
      <div className="d-flex flex-column align-items-start">
        <div className="d-flex flex-row align-items-center">
          <i className="fas fa-search text-primary me-2"></i>
          <h5 className="mb-0 fw-semibold text-dark">Busca de registros</h5>
        </div>
        <small className="text-secondary">Consulte os acessos por período ou pelos últimos minutos</small>
      </div>
    </div>

    <div className="card-body px-4 py-4">

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label mb-1 fw-semibold text-secondary mb-1">Data inicial</label>
          <input type="date" className="form-control busca-input" value={dataInicio} onChange={(event) => onDataInicioChange(event.target.value)} />
        </div>

        <div className="col-md-6">
          <label className="form-label mb-1 fw-semibold text-secondary mb-1">Data final</label>
          <input type="date" className="form-control busca-input input-busca" value={dataFim} onChange={(event) => onDataFimChange(event.target.value)} />
        </div>

        <div className="col-md-6">
          <label className="form-label mb-1 fw-semibold text-secondary mb-1 mt-1">Hora inicial</label>
          <input type="time" className="form-control busca-input input-busca" value={horaInicio} onChange={(event) => onHoraInicioChange(event.target.value)} />
        </div>

        <div className="col-md-6">
          <label className="form-label mb-1 fw-semibold text-secondary mb-1 mt-1">Hora final</label>
          <input type="time" className="form-control busca-input input-busca" value={horaFim} onChange={(event) => onHoraFimChange(event.target.value)} />
        </div>
      </div>

      <div className="d-flex flex-column align-items-center mt-4">
        <button className="btn btn-outline-primary" style={{width: "230px"}} onClick={onBuscaAvancada} disabled={buscarBloqueado}>
          <i className="fas fa-search me-2"></i>
          {buscarBloqueado ? mensagem : "Buscar registros"}
        </button>

        <div className="d-flex align-items-center my-3" style={{width: "230px"}}>
          <div className="flex-grow-1 border-top"></div>
          <span className="px-3 text-secondary small">ou</span>
          <div className="flex-grow-1 border-top"></div>
        </div>

        <div className="position-relative" style={{width: "230px"}}>
          <button className="btn btn-outline-secondary w-100" onClick={onBuscaRapida} disabled={buscarBloqueado}>
            <i className="fas fa-clock me-2"></i>
            {buscarBloqueado ? mensagem : "Últimos 5 minutos"}
          </button>
          <i className="fas fa-info-circle text-muted position-absolute" 
            aria-label="O que é RPA?" title="A busca automática é realizada por um robô (RPA), portanto pode haver uma demora para o retorno dos registros." 
            style={{cursor: "help", left: "245px", top: "50%", transform: "translateY(-50%)"}}></i>
        </div>
      </div>

    </div>
  </div>
);
}