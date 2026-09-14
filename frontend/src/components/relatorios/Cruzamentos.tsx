import { useEffect, useState } from "react";
import { carregarCruzamentos, type Cruzamento } from "../../services/cruzamento";

export default function Cruzamentos() {
  const [cruzamentos, setCruzamentos] = useState<Cruzamento[]>([]);

  useEffect(() => {
    let ativo = true;

    carregarCruzamentos()
      .then((dados) => {
        if (ativo) {
          setCruzamentos(dados);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar cruzamentos:", error);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="card-body p-0" style={{ maxHeight: "340px", overflowY: "auto" }}>
      <table className="table table-striped mb-0">
        <thead className="table-light" style={{ position: "sticky", top: 0 }}>
          <tr>
            <th>Usuário</th>
            <th>Data</th>
            <th>Porta</th>
          </tr>
        </thead>
        <tbody>
          {cruzamentos.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center">Nenhum acesso sem registro.</td>
            </tr>
          ) : (
            cruzamentos.map((cruzamento) => (
              <tr key={cruzamento.id}>
                <td>{cruzamento.usuario}</td>
                <td>{new Date(cruzamento.data_acesso).toLocaleString()}</td>
                <td>{cruzamento.porta}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}