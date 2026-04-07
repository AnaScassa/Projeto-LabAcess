import { useUsers } from "../../hooks/useUsers";
import { useTreinamento } from "../../hooks/useTreinamento";
import CalculadorTreinamentoPendente from "../../components/relatorios/TreinamentoPendente";
import Menu from "../../components/style/Menu";

export default function RelatorioTreinamentoPendente() {
  const { users } = useUsers();
  const { treinamentos } = useTreinamento();


  return (
    <div className="wrapper">
      <Menu />
      <div className="content-wrapper">
        <div className="content p-4">
          <div className="card">
            <div className="card-header text-center">
              <div className="tituloUltimoMes">
                <h3 className="card-title">Treinamentos pendentes</h3>
              </div>
              <CalculadorTreinamentoPendente
                users={users}
                treinamentos={treinamentos}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}