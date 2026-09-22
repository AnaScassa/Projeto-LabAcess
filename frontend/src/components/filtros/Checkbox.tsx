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
    <div className="w-100">
      <label className="form-label mb-1 fw-semibold text-secondary">Portas:</label>

      <div className="d-flex align-items-center flex-nowrap w-100" style={{gap: "8px", whiteSpace: "nowrap", overflowX: "auto"}}>
        <label className="d-flex align-items-center m-0 px-2 py-1 border rounded-2 bg-white flex-shrink-0" style={{cursor: "pointer", gap: "6px"}}>
          <input type="checkbox" checked={selecionadas.includes("todas")} onChange={() => toggle("todas")} style={{display: "none"}}/>
          <i style={{display: "inline-block", width: "42px", height: "28px", borderRadius: "19px", position: "relative", background: selecionadas.includes("todas") ? "#0d6efd" : "#dee2e6", transition: "0.2s", cursor: "pointer"}}>
            <span style={{display: "block", width: "22px", height: "22px", top: "3px", left: selecionadas.includes("todas") ? "17px" : "3px", borderRadius: "50%", background: "#fff", position: "absolute", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "0.2s"}}/>
          </i>
          <span className="form-label mb-1 fw-semibold text-secondary">Todas</span>
        </label>

        {portas.map((p, i) => (
          <label key={i} className="d-flex align-items-center m-0 px-2 py-1 border rounded-2 bg-white flex-shrink-0" style={{cursor: "pointer", gap: "6px"}}>
            <input type="checkbox" checked={selecionadas.includes(p)} onChange={() => toggle(p)} style={{display: "none"}}/>
            <i style={{display: "inline-block", width: "42px", height: "28px", borderRadius: "19px", position: "relative", background: selecionadas.includes(p) ? "#0d6efd" : "#dee2e6", transition: "0.2s", cursor: "pointer"}}>
              <span style={{display: "block", width: "22px", height: "22px", top: "3px", left: selecionadas.includes(p) ? "17px" : "3px", borderRadius: "50%", background: "#fff", position: "absolute", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "0.2s"}}/>
            </i>
            <span className="form-label mb-1 fw-semibold text-secondary">{p}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
