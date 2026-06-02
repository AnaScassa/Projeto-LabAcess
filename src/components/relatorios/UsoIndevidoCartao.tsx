import { useApontamento } from "../../hooks/useApontamento";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useApontamentoActions } from "../../hooks/useDesativamento";
import type { Apontamento } from "../../types/Apontamento";
import type { Usuario } from "../../types/Usuario";

export default function UsoIndevidoCartao() {
  const { usuarios } = useUsuarios();   
  const { apontamento } = useApontamento();  
  const { handleApontamento, handleApontamentoMultiple } = useApontamentoActions();

  const filteredApontamentos = apontamento.filter((ap: Apontamento) => {
    const isApontamento = String(ap.apontamento) === "1" || Number(ap.apontamento) === 1;

    const dataAcesso = new Date(ap.data_acesso);
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    const dentroDos30Dias = dataAcesso >= trintaDiasAtras;

    return isApontamento && dentroDos30Dias;
  });

  const handleLimparTodos = () => {
    const ids = filteredApontamentos.map((ap: Apontamento) => ap.id);
    handleApontamentoMultiple(ids);
  };

  return (
    <div className="col-md-6">
      <div className="card" style={{ height: "400px" }}>
        
        <div className="card-header">
          <h3 className="card-title" style={{ fontWeight: 500 }}>Uso indevido do cartão (último mês)</h3>
          <div className="d-flex gap-2 align-items-end justify-content-end">
            <button onClick={handleLimparTodos} className="btn btn-secondary d-flex justify-content-center align-items-center" 
              style={{ width: "25px", height: "25px", padding: 0 }} title="Limpar todos os registros">
              <i className="fas fa-trash m-0"></i>
            </button>
          </div>
        </div>

        <div
          className="card-body p-0"
          style={{ maxHeight: "340px", overflowY: "auto" }}>
          <table className="table table-striped mb-0">
            
            <thead className="table-light" style={{ position: "sticky", top: 0 }}>
              <tr>
                <th>Usuário</th>
                <th>Data</th>
                <th>Evento</th>
                <th style={{ width: "50px" }}></th>
              </tr>
            </thead>

            <tbody>
              {filteredApontamentos.map((ap: Apontamento) => {
                  const usuario = usuarios.find((u: Usuario) => u.matricula === ap.usuario_id);

                  return (
                    <tr key={ap.id}>
                      <td>
                        {usuario ? usuario.nome_usuario : "Não encontrado"}
                      </td>
                      <td>
                        {new Date(ap.data_acesso).toLocaleString()}
                      </td>
                      <td>{ap.desc_evento}</td>
                      <td>
                        <button
                          onClick={() => handleApontamento(ap.id)}
                          className="btn btn-danger d-flex justify-content-center align-items-center"
                          style={{ width: "55px", height: "35px", padding: 0 }}>
                          <i className="fas fa-trash m-0"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}