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

  return(
    <div>

      <p>Data inicio</p>
      <input
        type="date"
        value={inicio}
        onChange={(e) => handleInicio(e.target.value)}
      />

      <p>Data fim</p>
      <input
        type="date"
        value={fim}
        onChange={(e) => handleFim(e.target.value)}
      />

    </div>
  );
}