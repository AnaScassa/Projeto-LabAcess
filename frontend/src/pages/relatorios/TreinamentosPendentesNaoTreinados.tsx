import { useUsuarios } from "../../hooks/useUsuarios";
import { useTreinamento } from "../../hooks/useTreinamento";
import Menu from "../../components/style/Menu";
import UsuariosSemTreinamento from "../../components/relatorios/TreinamentosPendentesNaoTreinados";
import { useUsers } from "../../hooks/useUsers";

export default function TreinamentosPendentesNaoTreinados() {
  const { usuarios } = useUsuarios();
  const { treinamentos } = useTreinamento();
  const { users } = useUsers();

  return (
    <div className="wrapper">
      <Menu />
      <div className="content-wrapper">
        <div className="content p-4">
          <div className="card">
            <div className="card-header text-center">
              <div className="tituloUltimoMes">
                <h3 className="card-title">Treinamentos pendentes Não Treinados</h3>
              </div>
                <UsuariosSemTreinamento usuarios={usuarios} users={users} treinamentos={treinamentos} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}