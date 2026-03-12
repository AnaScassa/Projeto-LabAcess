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
    <div>
      <h3>Filtrar Portas</h3>

      <label style={{ display: "block" }}>
        <input
          type="checkbox"
          checked={selecionadas.includes("todas")}
          onChange={() => toggle("todas")}
        />
        <span style={{ marginLeft: "6px" }}>Todas</span>
      </label>

      {portas.map((p, i) => (
        <label key={i} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selecionadas.includes(p)}
            onChange={() => toggle(p)}
          />
          <span style={{ marginLeft: "6px" }}>{p}</span>
        </label>
      ))}
    </div>
    
  );
}
