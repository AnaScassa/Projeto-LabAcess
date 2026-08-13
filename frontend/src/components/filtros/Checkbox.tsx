interface FiltroPortasCheckboxProps {
  portas: string[];
  selecionadas: string[];
  onChange: (novas: string[]) => void;
}

export default function FiltroPortasCheckbox({
  portas,
  selecionadas,
  onChange
}: FiltroPortasCheckboxProps) {

  function toggle(valor: string) {
    if (valor === "todas") {
      if (!selecionadas.includes("todas")) {
        onChange(["todas", ...portas]);
      } 
      else {
        onChange([]);
      }
      return;
    }

    let novas = [...selecionadas];

    if (novas.includes(valor)) {
      novas = novas.filter(v => v !== valor);
    } else {
      novas.push(valor);
    }

    const todasMarcadas = portas.every(p => novas.includes(p));

    if (todasMarcadas) {
      novas = ["todas", ...portas];
    } else {
      novas = novas.filter(v => v !== "todas");
    }

    onChange(novas);
  }

  return (
    <div className="d-flex justify-content-center align-items-center flex-wrap" style={{ gap: "15px" }}>
      <label className="mb-0">Filtrar Portas:</label>

      <div className="form-check m-0">
        <input className="form-check-input" type="checkbox" checked={selecionadas.includes("todas")} onChange={() => toggle("todas")} id="todas"/>
        <label className="form-check-label" htmlFor="todas">Todas</label>
      </div>

      {portas.map((p, i) => (
        <div className="form-check m-0" key={i}>
          <input className="form-check-input" type="checkbox" checked={selecionadas.includes(p)} onChange={() => toggle(p)} id={p}/>
          <label className="form-check-label" htmlFor={p}>{p}</label>
        </div>
      ))}
    </div>
  );
}
