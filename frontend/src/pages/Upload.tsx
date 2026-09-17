import { useEffect, useState } from "react";
import { buscarRegistro } from "../services/buscarRegistro";
import GraficoAcessos from "../components/graficos/Acessos";
import GraficosUsuariosAtivos from "../components/graficos/UsuariosAtivos";
import Menu from "../components/style/Menu";
import UploadControls from "../components/upload/UploadControls";
import { solicitarPermissaoNotificacao } from "../utils/notificacoes";
import { useMailhogNotifications } from "../hooks/useMailhogNotifications";
import { useRpaStatus } from "../hooks/useRpaStatus";
import { useUpload } from "../hooks/useUpload";
import BuscaControls from "../components/upload/BuscaControls";

export default function Upload() {
  const { statusBusca, mensagem, iniciarBusca } = useRpaStatus();
  const { mensagem: mensagemUpload, loading, estaBloqueado, fileInputRef, handleUpload } = useUpload();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const buscarBloqueado = statusBusca !== null && statusBusca !== "finalizado" && statusBusca !== "erro";

  useMailhogNotifications();

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    solicitarPermissaoNotificacao();

    if (!storedToken) {
      window.location.replace("/login");
      return;
    }

  }, []);

  const validarBusca = () => {
    if (!dataInicio || !dataFim || !horaInicio || !horaFim) {
      alert("Preencha todas as datas e horários para realizar a busca.");
      return false;
    }

    const inicio = new Date(`${dataInicio}T${horaInicio}`);
    const fim = new Date(`${dataFim}T${horaFim}`);

    const agora = new Date();

    if (inicio > agora || fim > agora) {
      alert("Não é possível buscar registros futuros.");
      return false;
    }

    if (inicio > fim) {
      alert("A data inicial não pode ser maior que a data final.");
      return false;
    }

    const diferencaMs = fim.getTime() - inicio.getTime();
    const diferencaDias = diferencaMs / (1000 * 60 * 60 * 24);

    if (diferencaDias > 7) {
      alert("A busca não pode ultrapassar 7 dias de diferença.");
      return false;
    }

    return true;
};
  
  return (
    <div className="wrapper">
      <Menu/>

      <div className="content-wrapper">

        <h2 className="px-4 pt-2">Upload de Planilhas</h2>

        <section className="content px-4 pt-4">
          <div className="row gy-4">
            <div className="col-12">
              <UploadControls fileInputRef={fileInputRef} onUpload={handleUpload} estaBloqueado={estaBloqueado} loading={loading} mensagem2={mensagemUpload}/>
            </div>

            <div className="col-12">
              <BuscaControls buscarBloqueado={buscarBloqueado}
                mensagem={mensagem} dataInicio={dataInicio} dataFim={dataFim} horaInicio={horaInicio} horaFim={horaFim} onDataInicioChange={setDataInicio}
                onDataFimChange={setDataFim} onHoraInicioChange={setHoraInicio} onHoraFimChange={setHoraFim}
                onBuscaRapida={() => {
                  iniciarBusca();
                  void buscarRegistro(null, null, null, null);
                }}
                onBuscaAvancada={async () => {
                  if (!validarBusca()) {
                    return;
                  }
                  iniciarBusca();
                  await buscarRegistro(dataInicio, horaInicio, dataFim, horaFim);
                }}
              />
            </div>
            
          </div>
        </section>

        <section className="content px-4">
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header" style={{ backgroundColor: "#17a2b8" }}>
                  <h3 className="card-title" style={{ fontWeight: 500 }}>Acessos do último ano 2025</h3>
                </div>
                <div className="card-body" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GraficoAcessos />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header" style={{ backgroundColor: "#ffc107" }}>
                  <h3 className="card-title" style={{ fontWeight: 500 }}>Usuários que mais acessam o lab</h3>
                </div>
                <div className="card-body" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GraficosUsuariosAtivos />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}