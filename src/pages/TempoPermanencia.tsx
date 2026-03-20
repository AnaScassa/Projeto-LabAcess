import { useState } from "react";
import { useUsuarios } from "../hooks/useUsuarios";
import type { Usuario } from "../types/Usuario";
import CalculadorTempo from "../components/relatorios/UsuarioIndividual";
import FiltroPortasCheckbox from "../components/filtros/Checkbox";
import Filtrotempo from "../components/filtros/FiltroTempo";
import BotaoVoltar from "../components/style/BotaoVoltar";
import Menu from "../components/style/Menu";


export default function TempoPermanencia() {
  const [usuarioAtual, setUsuarioAtual] = useState<Usuario | null>(null);  
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");
  const [portasSelecionadas, setPortasSelecionadas] = useState<string[]>([]);  
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
  const [tempoFim, setTempoFim] = useState<Date | null>(null);
  const { usuarios } = useUsuarios();

  const portas = Array.from(
    new Set(
      Array.isArray(usuarios)
        ? usuarios.flatMap((u) =>
            u.acessos?.map((a) => a.desc_area) || []
          )
        : []
    )
  );

  function filtrarUsuario(matricula: string) {
    setUsuarioSelecionado(matricula);

    const usuario = usuarios.find(
      (u) => u.matricula === matricula
    );

    setUsuarioAtual(usuario || null);
    setPortasSelecionadas([]);
  }

  return (
    <div className="wrapper">
      <Menu/>
      <h1>Tempo de Permanência</h1>
      <BotaoVoltar/>
      <label>Usuário: </label>
      <select
        value={usuarioSelecionado}
        onChange={(e) => filtrarUsuario(e.target.value)}
      >
        <option value="">-- Selecione --</option>

        {usuarios.map((u) => (
          <option key={u.matricula} value={u.matricula}>
            {u.nome_usuario}
          </option>
        ))}
      </select>

      <FiltroPortasCheckbox
        portas={portas}
        selecionadas={portasSelecionadas}
        onChange={setPortasSelecionadas}
      />

      <Filtrotempo
        onChange={(inicio, fim) => {
          setTempoInicio(inicio);
          setTempoFim(fim);
        }}
      />
      <CalculadorTempo
        usuario={usuarioAtual}
        usuarios={usuarios}
        portasSelecionadas={portasSelecionadas}
        tempoInicio={tempoInicio}
        tempoFim={tempoFim}
      />
    </div>
  );
}
