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
      <Menu />

      <div className="content-wrapper">
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
          <i className="fas fa-clock text-primary me-2" style={{fontSize: "35px"}}></i>
          <h2 className="mb-0 fw-semibold text-dark">Relatório de tempo de Permanência</h2>
        </div>

        <small className="text-secondary px-4 pt-0 pb-2">Consulte o tempo de permanência dos usuários no laboratório</small>

        <section className="content px-4 pt-3">
          <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">
            <div className="card-header bg-white border-bottom px-4 py-3">
              <div className="d-flex flex-row align-items-center">
                <i className="fas fa-filter text-primary me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Filtros de consulta</h5>
              </div>
              <small className="text-secondary">Selecione o período, o usuário e as portas de acesso</small>
            </div>

            <div className="card-body px-4 py-4">
              <div className="d-flex flex-column" style={{gap: "20px"}}>
                <Filtrotempo onChange={(inicio, fim) => {setTempoInicio(inicio); setTempoFim(fim);}}/>

                <div className="row g-3 align-items-start">
                  <div className="col-12 col-lg-8">
                    <div className="form-group">
                      <label className="form-label mb-1 fw-semibold text-secondary">Usuário</label>

                      <div className="input-group w-100 flex-nowrap">
                        <select className="form-control" value={usuarioSelecionado} onChange={(e) => filtrarUsuario(e.target.value)}>
                          <option value="">-- Selecione --</option>
                          {[...usuariosUnicos].sort((a, b) => a.nome_usuario.localeCompare(b.nome_usuario)).map((u) => (
                            <option key={u.matricula} value={u.matricula}>{u.nome_usuario}</option>
                          ))}
                        </select>

                        <div className="input-group-text bg-white">
                          <i className="fas fa-user text-primary"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-4">
                    <FiltroPortasCheckbox portas={portas} selecionadas={portasSelecionadas} onChange={setPortasSelecionadas}/>
                  </div>
                </div>
              </div>
            </div>

            <CalculadorTempo usuario={usuarioAtual} usuarios={usuarios} portasSelecionadas={portasSelecionadas} tempoInicio={tempoInicio} tempoFim={tempoFim}/>
          </div>
        </section>
      </div>
    </div>
  );
}

