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
    <div className="d-flex justify-content-center align-items-center flex-wrap" style={{ gap: "15px" }}>
      <label className="mb-0">Filtrar Categoria:</label>

      <div className="form-check m-0">
        <input className="form-check-input" type="checkbox" checked={selecionadas.includes("todas")} onChange={() => toggle("todas")} id="todasCategorias"/>
        <label className="form-check-label" htmlFor="todasCategorias">Todas</label>
      </div>

      <div className="form-check m-0">
        <input className="form-check-input" type="checkbox" checked={selecionadas.includes("ALUNO")} onChange={() => toggle("ALUNO")} id="aluno"/>
        <label className="form-check-label" htmlFor="aluno">Aluno</label>
      </div>

      <div className="form-check m-0">
        <input className="form-check-input" type="checkbox" checked={selecionadas.includes("FUNCIONARIO")} onChange={() => toggle("FUNCIONARIO")} id="funcionario"/>
        <label className="form-check-label" htmlFor="funcionario">Funcionário</label>
      </div>
    </div>
  );
}