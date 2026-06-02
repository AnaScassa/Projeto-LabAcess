import { useApontamento } from "../../hooks/useApontamento";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useApontamentoActions } from "../../hooks/useDesativamento";
import type { Apontamento } from "../../types/Apontamento";
import type { Usuario } from "../../types/Usuario";

export default function AcessoIndevidos() {
  const { usuarios } = useUsuarios();
  const { apontamento } = useApontamento();
  const { handleApontamento, handleApontamentoMultiple } = useApontamentoActions();

  const isLastWeek = (data: string): boolean => {
    const dataAcesso = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const umaSemanaAtras = new Date(hoje);
    umaSemanaAtras.setDate(hoje.getDate() - 7);
    return dataAcesso >= umaSemanaAtras && dataAcesso < hoje;
  };

  const filteredApontamentos = apontamento.filter((ap: Apontamento) =>
    (String(ap.apontamento) === "2" || Number(ap.apontamento) === 2) && isLastWeek(ap.data_acesso))
    .sort((a: Apontamento, b: Apontamento) => new Date(b.data_acesso).getTime()  - new Date(a.data_acesso).getTime());

  const handleLimparTodos = () => {
    const ids = filteredApontamentos.map((ap: Apontamento) => ap.id);
    handleApontamentoMultiple(ids);
  };

  return (
    <div className="col-md-6">
      <div className="card" style={{ height: "400px" }}>
        
     <div className="card-header">
        <h3 className="card-title d-flex align-items-center" style={{ fontWeight: 500, gap: "8px" }}>Uso inconsistente do cartão (última semana)
          <i className="fas fa-info-circle align-items-center" style={{fontSize: "14px", cursor: "pointer", color: "#6c757d"}}
            title="Os dados do dia de hoje aparecerão amanhã.">
          </i>
        </h3>
        <div className="d-flex gap-2 align-items-end justify-content-end">
          <button onClick={handleLimparTodos} className="btn btn-secondary d-flex justify-content-center align-items-center" 
            style={{ width: "25px", height: "25px", padding: 0 }} title="Limpar todos os registros">
            <i className="fas fa-trash m-0"></i>
          </button>
        </div>
      </div>

        <div className="card-body p-0" style={{ maxHeight: "340px", overflowY: "auto" }}>
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
                        <td>
                          {ap.ent_sai === "1" ? "Usuário entrou e não saiu" : "Usuário saiu e não entrou"}
                        </td>
                        <td>
                          <button
                            onClick={() => handleApontamento(ap.id)}
                            className="btn btn-danger d-flex justify-content-center align-items-center"
                            style={{width: "55px", height: "35px", padding: 0}}>
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