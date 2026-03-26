import { useApontamento } from "../../hooks/useApontamento";
import { useUsuarios } from "../../hooks/useUsuarios";
import type { Apontamento } from "../../types/Apontamento";
import type { Usuario } from "../../types/Usuario";

export default function UsoIndevidoCartao() {
  const { usuarios } = useUsuarios();   
  const { apontamento } = useApontamento();  

  const handleApontamento = async (id: number) => {
    const storedToken = localStorage.getItem("access");

    try {
      const response = await fetch(
        `http://localhost:8000/api/acesso/desativar-apontamento/${id}/`,
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
          <h3 className="card-title">Uso indevido do cartão</h3>
        </div>

        <div
          className="card-body p-0"
          style={{ maxHeight: "340px", overflowY: "auto" }}
        >
          <table className="table table-striped mb-0">
            
            <thead
              className="table-light"
              style={{ position: "sticky", top: 0 }}
            >
              <tr>
                <th>Usuário</th>
                <th>Data</th>
                <th>Evento</th>
                <th style={{ width: "50px" }}></th>
              </tr>
            </thead>

            <tbody>
              {apontamento.map((ap: Apontamento) => {

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
                    <td>{ap.desc_evento}</td>
                    <td>
                      <button
                        onClick={() => handleApontamento(ap.id)}
                        className="btn btn-danger d-flex justify-content-center align-items-center"
                        style={{
                          width: "55px",
                          height: "35px",
                          padding: 0
                        }}
                      >
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