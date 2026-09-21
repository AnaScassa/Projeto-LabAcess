import { useState } from "react";

interface FiltroTempoProps{
  onChange: (inicio: Date | null, fim: Date | null) => void;
}

export default function Filtrotempo({ onChange }: FiltroTempoProps){

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  function handleInicio(valor: string){
    setInicio(valor);
    onChange(valor ? new Date(valor) : null, fim ? new Date(fim) : null);
  }

  function handleFim(valor: string){
    setFim(valor);
    onChange(inicio ? new Date(inicio) : null, valor ? new Date(valor) : null);
  }

  return (
    <div className="row justify-content-center g-3">
      <div className="col-md-6">
        <label className="form-label mb-1 fw-semibold text-secondary">Data início</label>
        <input type="date" className="form-control" value={inicio} onChange={(e) => handleInicio(e.target.value)}/>
      </div>

      <div className="col-md-6">
        <label className="form-label mb-1 fw-semibold text-secondary">Data fim</label>
        <input type="date" className="form-control" value={fim} onChange={(e) => handleFim(e.target.value)}/>
      </div>
    </div>
  );
}