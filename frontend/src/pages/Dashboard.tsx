import UsoIndevidoCartao from "../components/relatorios/UsoIndevidoCartao";
import ContagemTreinamento from "../components/style/ContagemTreinamento";
import Menu from "../components/style/Menu";
import AcessoIndevidos from "../components/relatorios/AcessosIndevidos";
import UltimosAcessos from "../components/relatorios/UltimosAcessos";
import Cruzamentos from "../components/relatorios/Cruzamentos";
import StatusAluno from "../components/relatorios/StatusUsuario";
import { useTreinamento } from "../hooks/useTreinamento";

export default function Dashboard() {
  const { treinamentos } = useTreinamento();

  return (
    <div className="wrapper">
      <Menu />

      <div className="content-wrapper">
        <h2 className="px-4 pt-2 mb-0">Dashboard Controle do Laboratório</h2>

        <section className="content px-4 pt-4 pb-4">
          <ContagemTreinamento treinamentos={treinamentos} />
        </section>

        <section className="content px-4">
          <StatusAluno />
        </section>

        <section className="content px-4">
          <div className="row">
            <div className="col-md-6 pb-4">
              <div className="card m-0" style={{ height: "400px" }}>
                <UltimosAcessos />
              </div>
            </div>
            <UsoIndevidoCartao />
          </div>
        </section>

        <section className="content px-4">
            <div className="row">
                <div className="col-md-6 pb-4">
                  <div className="card">
                    <Cruzamentos />
                  </div>
                </div>
                <AcessoIndevidos />
            </div>
        </section>

      </div>
    </div>
  );
}
