interface FiltroCategoriaCheckboxProps {
  selecionadas: string[];
  onChange: (novas: string[]) => void;
}

export default function FiltroCategoriaCheckbox({
  selecionadas,
  onChange,
}: FiltroCategoriaCheckboxProps) {

  const categorias = ["ALUNO", "FUNCIONARIO"];

  function toggle(valor: string) {
    if (valor === "todas") {
      if (!selecionadas.includes("todas")) {
        onChange(["todas", ...categorias]);
      } else {
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

    const todasMarcadas = categorias.every(c => novas.includes(c));

    if (todasMarcadas) {
      novas = ["todas", ...categorias];
    } else {
      novas = novas.filter(v => v !== "todas");
    }

    onChange(novas);
  }

  return (
    <div className="w-100">
      <label className="form-label mb-1 fw-semibold text-secondary">Filtrar Categoria:</label>

      <div className="d-flex align-items-center flex-nowrap w-100" style={{gap: "8px", whiteSpace: "nowrap", overflowX: "auto"}}>
        <label className="d-flex align-items-center m-0 px-2 py-1 border rounded-2 bg-white flex-shrink-0" style={{cursor: "pointer", gap: "6px"}}>
          <input type="checkbox" checked={selecionadas.includes("todas")} onChange={() => toggle("todas")} style={{display: "none"}}/>
          <i style={{display: "inline-block", width: "42px", height: "28px", borderRadius: "19px", position: "relative", background: selecionadas.includes("todas") 
            ? "#0d6efd" : "#dee2e6", transition: "0.2s", cursor: "pointer"}}>
            <span style={{display: "block", width: "22px", height: "22px", top: "3px", left: selecionadas.includes("todas") ? "17px" : "3px", 
              borderRadius: "50%", background: "#fff", position: "absolute", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "0.2s"}}/>
          </i>
          <span className="small fw-semibold text-secondary">Todas</span>
        </label>

        <label className="d-flex align-items-center m-0 px-2 py-1 border rounded-2 bg-white flex-shrink-0" style={{cursor: "pointer", gap: "6px"}}>
          <input type="checkbox" checked={selecionadas.includes("ALUNO")} onChange={() => toggle("ALUNO")} style={{display: "none"}}/>
          <i style={{display: "inline-block", width: "42px", height: "28px", borderRadius: "19px", position: "relative", background: selecionadas.includes("ALUNO") 
            ? "#0d6efd" : "#dee2e6", transition: "0.2s", cursor: "pointer"}}>
            <span style={{display: "block", width: "22px", height: "22px", top: "3px", left: selecionadas.includes("ALUNO") ? "17px" : "3px", 
              borderRadius: "50%", background: "#fff", position: "absolute", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "0.2s"}}/>
          </i>
          <span className="small fw-semibold text-secondary">Aluno</span>
        </label>

        <label className="d-flex align-items-center m-0 px-2 py-1 border rounded-2 bg-white flex-shrink-0" style={{cursor: "pointer", gap: "6px"}}>
          <input type="checkbox" checked={selecionadas.includes("FUNCIONARIO")} onChange={() => toggle("FUNCIONARIO")} style={{display: "none"}}/>
          <i style={{display: "inline-block", width: "42px", height: "28px", borderRadius: "19px", position: "relative", background: selecionadas.includes("FUNCIONARIO")
            ? "#0d6efd" : "#dee2e6", transition: "0.2s", cursor: "pointer"}}>
            <span style={{display: "block", width: "22px", height: "22px", top: "3px", left: selecionadas.includes("FUNCIONARIO") ? "17px" : "3px", 
              borderRadius: "50%", background: "#fff", position: "absolute", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "0.2s"}}/>
          </i>
          <span className="small fw-semibold text-secondary">Funcionário</span>
        </label>
      </div>
    </div>
  );
}