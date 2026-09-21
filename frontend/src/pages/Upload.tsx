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
        <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
          <i className="fas fa-upload text-primary me-2" style={{ fontSize: "35px" }} ></i>
          <h2 className="mb-0 fw-semibold text-dark">Upload de Planilhas</h2>
        </div>
        <small className="text-secondary px-4 pt-0 pb-2">Envie uma planilha para processamento</small>

        <section className="content px-4 pt-2">
          <div className="row gy-4">
              <div className="col-12 pt-3">
                  <UploadControls fileInputRef={fileInputRef} onUpload={handleUpload} estaBloqueado={estaBloqueado} loading={loading} mensagem2={mensagemUpload} />
              </div>

              <div className="col-12 pt-2 pb-4">
                <BuscaControls buscarBloqueado={buscarBloqueado} mensagem={mensagem} dataInicio={dataInicio} dataFim={dataFim}
                  horaInicio={horaInicio} horaFim={horaFim} onDataInicioChange={setDataInicio} onDataFimChange={setDataFim}
                  onHoraInicioChange={setHoraInicio} onHoraFimChange={setHoraFim}
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
          <div className="col-md-6 pb-4">
            <div className="card rounded-3 shadow-sm overflow-hidden m-0" style={{ borderTop: "4px solid #17a2b8" }}>
              <div className="card-header bg-white border-bottom px-4 py-3">
                <div className="d-flex flex-row align-items-center">
                  <i className="fas fa-chart-bar text-primary me-2 pt-1"></i>
                  <h5 className="mb-0 fw-semibold text-dark">Acessos do último ano 2025</h5>
                </div>
                <div>
                  <small className="text-secondary">Quantidade de acessos registrados ao longo do ano</small>
                </div>
              </div>

              <div className="card-body p-3" style={{height: "400px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <GraficoAcessos />
              </div>
            </div>
          </div>

          <div className="col-md-6 pb-4">
            <div className="card rounded-3 shadow-sm overflow-hidden m-0" style={{ borderTop: "4px solid #ffc107" }}>
              <div className="card-header bg-white border-bottom px-4 py-3">
                <div className="d-flex flex-row align-items-center">
                  <i className="fas fa-chart-pie text-primary me-2"></i>
                  <h5 className="mb-0 fw-semibold text-dark">Usuários que mais acessam o lab</h5>
                </div>
                <div>
                  <small className="text-secondary">Usuários com maior quantidade de acessos ao laboratório</small>
                </div>
              </div>

              <div className="card-body p-3" style={{height: "400px", display: "flex", alignItems: "center", justifyContent: "center"}}>
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