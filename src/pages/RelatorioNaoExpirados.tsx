import { useState, useMemo } from "react";
import { useUsers } from "../hooks/useUsers";
import { useTreinamento } from "../hooks/useTreinamento";
import { useUsuarios } from "../hooks/useUsuarios";
import CalculadorNaoExpirados from "../components/logicas/CalculadorNaoExpirados";
import BotaoVoltar from "../components/style/BotaoVoltar";
import FiltroPortasCheckbox from "../components/logicas/FiltroPortasCheckbox";

export default function RelatorioNaoExpirados() {
  const { users } = useUsers();
  const { treinamentos } = useTreinamento();
  const { usuarios } = useUsuarios();

  const [portasSelecionadas, setPortasSelecionadas] = useState<string[]>([]);

  const portas = useMemo(() => {
    return Array.from(
      new Set(
        Array.isArray(usuarios)
          ? usuarios.flatMap((u) => u.acessos?.map((a) => a.desc_area) || [])
          : []
      )
    );
  }, [usuarios]);

  return (
    <div>
      <h1>Treinamentos não expirados</h1>

      <BotaoVoltar />

      <FiltroPortasCheckbox
        portas={portas}
        selecionadas={portasSelecionadas}
        onChange={setPortasSelecionadas}
      />
      <br /> <br />

      <CalculadorNaoExpirados
        users={users}
        usuarios={usuarios}
        treinamentos={treinamentos}
        portasSelecionadas={portasSelecionadas}
      />
    </div>
  );
}
