import { useApontamento } from "../../hooks/useApontamento";
import { useUsuarios } from "../../hooks/useUsuarios";
import type { Apontamento } from "../../types/Apontamento";
import type { Usuario } from "../../types/Usuario";
import { API_HOST } from "../../utils/static";

export default function AcessoIndevidos() {
  const { usuarios } = useUsuarios();   
  const { apontamento } = useApontamento();  

  const isLastMonth = (data: string): boolean => {
    const dataAcesso = new Date(data);
    const dataAtual = new Date();
    const umMesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, dataAtual.getDate());
    return dataAcesso >= umMesAtras;
  };

  const handleApontamento = async (id: number) => {
    const storedToken = localStorage.getItem("access");

    try {
      const response = await fetch(
        `http://${API_HOST}:8000/api/acesso/desativar-apontamento/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${storedToken}`,
          }
        }
      );

      if (response.ok) {
        window.location.reload();
        alert("Registro apagado!");
      } else {
        console.log("Erro na resposta:", response.status);
      }
    } catch (error) {
      console.log("Erro na api excluir apontamento", error);
    }
  };

  return (
    <div className="col-md-6">
      <div className="card" style={{ height: "400px" }}>
        
        <div className="card-header">
          <h3 className="card-title">Uso inconsistente do cartão (último mês)</h3>
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
              {apontamento.filter((ap: Apontamento) => (String(ap.apontamento) === '2' || Number(ap.apontamento) === 2) && isLastMonth(ap.data_acesso)).map((ap: Apontamento) => {

                const usuario = usuarios.find(
                  (u: Usuario) => u.matricula === ap.usuario_id
                );

                return (
                  <tr key={ap.id}>
                    <td>
                      {usuario ? usuario.nome_usuario : "Não encontrado"}
                    </td>
                    <td>
                      {new Date(ap.data_acesso).toLocaleString()}
                    </td>
                    <td>{ap.ent_sai === '1' ? 'Usuário entrou e não saiu' : 'Usuário saiu e não entrou'}</td>
                    <td>
                      <button onClick={() => handleApontamento(ap.id)} className="btn btn-danger d-flex justify-content-center align-items-center"
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