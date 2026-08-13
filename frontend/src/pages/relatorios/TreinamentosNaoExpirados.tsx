import { useState, useMemo } from "react";
import { useUsers } from "../../hooks/useUsers";
import { useTreinamento } from "../../hooks/useTreinamento";
import { useUsuarios } from "../../hooks/useUsuarios";
import CalculadorNaoExpirados from "../../components/relatorios/Treinamento";
import FiltroPortasCheckbox from "../../components/filtros/Checkbox";
import Menu from "../../components/style/Menu";


export default function RelatorioNaoExpirados() {
  const { users } = useUsers();
  const { treinamentos } = useTreinamento();
  const { usuarios } = useUsuarios();
  const [portasSelecionadas, setPortasSelecionadas] = useState<string[]>([]);

  const portas = useMemo(() => {
    return Array.from(new Set(Array.isArray(usuarios) ? usuarios.flatMap((u) => u.acessos?.map((a) => a.desc_area) || []): []));
  }, [usuarios]);

  return (
    <div className="wrapper">
      <Menu/>
      <div className="content-wrapper">
        <div className="content p-4">
          <div className="card">
            <div className="card-header text-center">
              <div className="tituloUltimoMes">
                <h3 className="card-title">Treinamentos não expirados</h3>
              </div>
              <div className="py-4">
                <FiltroPortasCheckbox portas={portas} selecionadas={portasSelecionadas} onChange={setPortasSelecionadas}/>
              </div>
                <CalculadorNaoExpirados users={users} usuarios={usuarios} treinamentos={treinamentos} portasSelecionadas={portasSelecionadas}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
