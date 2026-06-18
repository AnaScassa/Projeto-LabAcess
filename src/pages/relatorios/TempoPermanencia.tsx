import { useState } from "react";
import { useUsuarios } from "../../hooks/useUsuarios";
import { removerUsuariosDuplicados } from "../../utils/removerUsuariosDuplicados";
import type { Usuario } from "../../types/Usuario";
import CalculadorTempo from "../../components/relatorios/UsuarioIndividual";
import FiltroPortasCheckbox from "../../components/filtros/Checkbox";
import Filtrotempo from "../../components/filtros/FiltroTempo";
import Menu from "../../components/style/Menu";


export default function TempoPermanencia() {
  const [usuarioAtual, setUsuarioAtual] = useState<Usuario | null>(null);  
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");
  const [portasSelecionadas, setPortasSelecionadas] = useState<string[]>([]);  
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
  const [tempoFim, setTempoFim] = useState<Date | null>(null);
  const { usuarios } = useUsuarios();
  const usuariosUnicos = removerUsuariosDuplicados(usuarios);

  const portas = Array.from(new Set(Array.isArray(usuarios) ? usuarios.flatMap((u) => u.acessos?.map((a) => a.desc_area) || []) : []));

  function filtrarUsuario(matricula: string) {
    setUsuarioSelecionado(matricula);
    const usuario = usuariosUnicos.find((u) => u.matricula === matricula);
    setUsuarioAtual(usuario || null);
    setPortasSelecionadas([]);
  }
                      
  return (
    <div className="wrapper">
      <Menu/>
      <div className="content-wrapper">
        <div className="content p-4">
          <div className="card">
            <div className="card-header text-center">
              <div className="tituloUltimoMes">
                <h3 className="card-title">Tempo de Permanência de cada Usuario</h3>
              </div>
              <div className="d-flex flex-column" style={{ gap: "20px", marginTop: "20px" }}>
                <FiltroPortasCheckbox portas={portas} selecionadas={portasSelecionadas} onChange={setPortasSelecionadas}/>
                <Filtrotempo onChange={(inicio, fim) => {setTempoInicio(inicio); setTempoFim(fim);}}/>
                <div className="row">
                  <div className="col-md-6 mx-auto">
                    <div className="form-group">
                      <label>Usuário:</label>
                      <div className="input-group">
                        <select className="form-control" value={usuarioSelecionado} onChange={(e) => filtrarUsuario(e.target.value)}>
                          <option value="">-- Selecione --</option>
                          {[...usuariosUnicos].sort((a, b) => a.nome_usuario.localeCompare(b.nome_usuario)).map((u) => (
                            <option key={u.matricula} value={u.matricula}>{u.nome_usuario}</option>))}
                        </select>
                        <div className="input-group-append">
                          <div className="input-group-text">
                            <i className="fas fa-user"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                <CalculadorTempo usuario={usuarioAtual} usuarios={usuarios} portasSelecionadas={portasSelecionadas} tempoInicio={tempoInicio} tempoFim={tempoFim}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

