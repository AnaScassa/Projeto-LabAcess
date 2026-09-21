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
    <div className="d-flex align-items-center flex-wrap" style={{gap: "18px"}}>
      <span className="small text-dark fw-semibold">Portas:</span>

      <label className="d-flex align-items-center m-0" style={{cursor: "pointer"}}>
        <input type="checkbox" checked={selecionadas.includes("todas")} onChange={() => toggle("todas")} style={{display: "none"}}/>

        <i style={{ display: "inline-block", width: "33px", height: "16px", borderRadius: "10px", position: "relative", 
          background: selecionadas.includes("todas") ? "#0d6efd" : "#deeff7", transition: "0.25s", cursor: "pointer"}}
        >
          <span className="fw-semibold" style={{display: "block", width: "10px", height: "10px", top: "3px", left: selecionadas.includes("todas") ? "21px" : "3px",
            borderRadius: "50%", background: "#fff", position: "absolute", boxShadow: "1px 2px 4px rgba(0,0,0,0.25)", transition: "0.15s"}}
          />
        </i>

        <span className="small fw-semibold text-secondary">Todas</span>
      </label>

      {portas.map((p, i) => (
        <label key={i} className="d-flex align-items-center m-0" style={{cursor: "pointer"}}>
          <input type="checkbox" checked={selecionadas.includes(p)} onChange={() => toggle(p)} style={{display: "none"}}/>

          <i style={{display: "inline-block", width: "33px", height: "16px", borderRadius: "10px", position: "relative",
              background: selecionadas.includes(p) ? "#0d6efd" : "#deeff7", transition: "0.25s", cursor: "pointer"}}
          >
            <span style={{display: "block", width: "10px", height: "10px", top: "3px", left: selecionadas.includes(p) ? "21px" : "3px",
                borderRadius: "50%", background: "#fff", position: "absolute", boxShadow: "1px 2px 4px rgba(0,0,0,0.25)", transition: "0.15s"}}
            />
          </i>

          <span className="small text-secondary">{p}</span>
        </label>
      ))}
    </div>
  );
}
