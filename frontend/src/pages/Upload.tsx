import { TailSpin } from "react-loader-spinner";
import { useState, useEffect } from "react";
import { useTreinamento } from "../hooks/useTreinamento";
import { buscarRegistro } from "../services/buscarRegistro";
import { buscarUltimaResposta } from "../services/buscarResposta";
import GraficoAcessos from "../components/graficos/Acessos";
import GraficosUsuariosAtivos from "../components/graficos/UsuariosAtivos";
import UsoIndevidoCartao from "../components/relatorios/UsoIndevidoCartao";
import ContagemTreinamento from "../components/style/ContagemTreinamento";
import Menu from "../components/style/Menu";
import AcessoIndevidos from "../components/relatorios/AcessosIndevidos";
import UltimosAcessos from "../components/relatorios/UltimosAcessos";
import StatusAluno from "../components/relatorios/StatusUsuario"
import { solicitarPermissaoNotificacao } from "../utils/notificacoes";
import { useMailhogNotifications } from "../hooks/useMailhogNotifications";
import { fazerUpload } from "../services/upload";
import { verificarProcessamento } from "../services/processamento";
import { verificarId } from "../services/conferirid";

export default function Upload() {
  const [mensagem, setMensagem] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [estaBloqueado, setEstaBloqueado] = useState<boolean>(false);
  const [statusBusca, setStatusBusca] = useState<string | null>(null);  
  const { treinamentos } = useTreinamento();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const buscarBloqueado = statusBusca !== null && statusBusca !== undefined && statusBusca !== "finalizado" && statusBusca !== "erro";

  useMailhogNotifications();

    useEffect(() => {

      async function carregarUltimoStatus() {
        try {
          const dados = await buscarUltimaResposta();

          console.log("Última resposta do RPA:", dados);

          if (dados?.status === null || dados?.status === undefined) {
            setStatusBusca(null);
            setMensagem("Aguardando resposta do RPA...");
            return;
          }

          const status = String(dados.status).toLowerCase();

          setStatusBusca(status);

          if (status === "finalizado") {
            setMensagem(
              `Busca finalizada. Quantidade: ${dados.quantidade ?? 0}`
            );
            return;
          }

          if (status === "erro") {
            setMensagem(`Busca com erro: ${dados.status}`);
            return;
          }

          if (status === "pending") {
            setMensagem("Aguardando resposta do RPA...");
            return;
          }

          setMensagem(`Status do RPA: ${dados.status}`);

        } catch (erro) {
          console.error("Erro ao buscar último status:", erro);
          setStatusBusca(null);
        }
      }

      carregarUltimoStatus();

    }, []);
  
  useEffect(() => {
      const storedToken = localStorage.getItem("access");
      solicitarPermissaoNotificacao();

      if (!storedToken) {
          window.location.replace("/login");
          return;
      }

      setToken(storedToken);

    verificarProcessamento(() => {
      setLoading(false);
      setEstaBloqueado(false);
      setMensagem("Processamento concluído!");
    });

  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const usuario_id = localStorage.getItem("id");

      if (!usuario_id) {
        window.location.replace("/login")
        throw new Error("ID do usuário não encontrado");
      }

        const response = await verificarId(usuario_id);

        if (response.status === 200) {
          setMensagem("Já existe um arquivo sendo processado.");
          return;
        }

        if (response.status !== 200 && response.status !== 201) {
          setMensagem("Erro ao verificar processamento.");
          return;
        }

        setMensagem("Processando arquivo");

    } catch (error) {
      console.error(error);
      console.log("deu erro!");
      window.location.replace("/login");
    }

    setEstaBloqueado(true);

    if (!token) {
      setMensagem("Sessão expirada. Faça login novamente.");
      window.location.replace("/login");
      return;
    }

    const fileInput = document.getElementById("fileInput") as HTMLInputElement;

    if (!fileInput.files || !fileInput.files[0]) {
      setMensagem("Selecione um arquivo primeiro!");
      setEstaBloqueado(false);
      return;
    }

    try {
      const file = fileInput.files[0];
      const resposta = await fazerUpload(file);

      if (!resposta) {
        setMensagem("Erro no upload.");
        setEstaBloqueado(false);
        return;
      }

      setMensagem("Processamento sendo feito...");
      setLoading(true);

      verificarProcessamento(() => {
        setLoading(false);
        setEstaBloqueado(false);
        setMensagem("Processamento concluído!");
      });

    } catch (error) {
      console.error(error);
      setMensagem("Erro no upload.");
      setEstaBloqueado(false);
    }
  };
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

        <h2 className="px-4 pt-2">Dashboard Controle do Laboratório</h2>

        <section className="content px-4 pt-4">
          <ContagemTreinamento treinamentos={treinamentos} />
        </section>

        <section className="content px-4">
          <div className="row">

            <div className="col-md-6">
              <div className="card" style={{ height: "400px" }}>
                <div className="card-header">
                  <h3 className="card-title" style={{ fontWeight: 500 }}>Upload de Arquivos</h3>
                </div>

                <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ height: "100%", gap: "20px" }}>
                  <form onSubmit={handleUpload}>
                    <div className="d-flex flex-column" style={{ gap: "30px" }}>
                      <input type="file" id="fileInput" accept=".xls,.csv" />

                      <div className="d-flex flex-column align-items-center" style={{ width: "100%" }}>
                        <button className="btn btn-primary" type="submit" disabled={estaBloqueado} style={{ minWidth: "130px" }}>
                          {estaBloqueado ? "Enviando..." : "Enviar"}
                        </button>
                      </div>
                    </div>
                  </form>

                  {loading && (
                    <div className="mt-3">
                      <TailSpin height="50" width="50" color="#007bff" />
                    </div>
                  )}
                  
                </div>

                <div className="card-footer footer-busca">
                  <button className="btn btn-outline-secondary" onClick={async () => {
                    setStatusBusca("PENDING");
                    setMensagem("Enviando busca ao RPA...");
                    await buscarRegistro(null, null, null, null);
                  }} disabled={buscarBloqueado}>
                    <i className="fas fa-sync-alt me-2"></i>
                    {buscarBloqueado ? mensagem : "Buscar registros dos últimos 5 minutos"}
                  </button>

                  <details className="details-custom">
                    <summary className="btn btn-outline-secondary btn-sm">
                      <div className="d-flex align-items-center justify-content-center w-100">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </summary>

                    <div className="details-content card shadow-sm mt-3">
                      <div className="card-body ">

                        <h6 className="mb-3 text-center">
                          <i className="fas fa-search me-2"></i>
                          Busca Avançada
                        </h6>

                        <div className="row g-3">

                          <div className="col-md-6">
                            <label className="form-label">Data inicial</label>
                            <input type="date" className="form-control" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Data final</label>
                            <input type="date" className="form-control" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Hora inicial</label>
                            <input type="time" className="form-control" value={horaInicio}  onChange={(e) => setHoraInicio(e.target.value)} />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Hora final</label>
                            <input type="time" className="form-control" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                          </div>

                        </div>

                        <hr/>

                        <div className="text-center">
                          <button className="btn btn-outline-secondary" onClick={async () => {
                            if (!validarBusca()) {
                              return;
                            }

                            setStatusBusca("PENDING");
                            setMensagem("Enviando busca ao RPA...");
                            await buscarRegistro(dataInicio, horaInicio, dataFim, horaFim);
                          }} disabled={buscarBloqueado}>
                            <i className="fas fa-sync-alt me-2"></i>
                            {buscarBloqueado ? mensagem : "Buscar registros"}
                          </button>
                        </div>

                      </div>
                    </div>
                  </details>
                </div>

              </div>
            </div>
            <div className="col-md-6">
              <div className="card" style={{ height: "400px" }}>
                <div className="card-header">
                  <h3 className="card-title" style={{ fontWeight: 500 }}>Últimos Acessos (24 horas)</h3>
                </div>
                  <UltimosAcessos />
              </div>
            </div>
            
          </div>
        </section>

        <section className="content px-4">
          <div className="row">

            <UsoIndevidoCartao/>

            <AcessoIndevidos/>

          </div>
        </section>

        <section className="content px-4">
            <StatusAluno/>      
        </section>

        <section className="content px-4">
            <div className="row">

              <div className="col-md-6">
                <div className="card" >
                  <div className="card-header" style={{ backgroundColor: '#17a2b8' }}>
                    <h3 className="card-title" style={{ fontWeight: 500 }}>Acessos do último ano {new Date().getFullYear() - 1}</h3>
                  </div>

                  <div className="card-body" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GraficoAcessos />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card">
                  <div className="card-header" style={{ backgroundColor: "#ffc107"}}>
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