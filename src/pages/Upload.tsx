import { TailSpin } from "react-loader-spinner";
import { useState, useEffect } from "react";
import { useTreinamento } from "../hooks/useTreinamento";
import { authFetch } from "../services/auth";
import { buscarRegistro } from "../services/buscarRegistro";
import GraficoAcessos from "../components/graficos/Acessos";
import GraficosUsuariosAtivos from "../components/graficos/UsuariosAtivos";
import UsoIndevidoCartao from "../components/relatorios/UsoIndevidoCartao";
import ContagemTreinamento from "../components/style/ContagemTreinamento";
import Menu from "../components/style/Menu";
import { API_HOST } from "../utils/static";
import AcessoIndevidos from "../components/relatorios/AcessosIndevidos";
import UltimosAcessos from "../components/relatorios/UltimosAcessos";

export default function Upload() {
  const [mensagem, setMensagem] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [estaBloqueado, setEstaBloqueado] = useState<boolean>(false);
  const [bloqueado, setBloqueado] = useState(false);
  const { treinamentos } = useTreinamento();
  
  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    
    if (!storedToken) {
      window.location.replace("/login");
      return;
    }
    
    setToken(storedToken);
    
    const verificarProcessamento = async () => {
      try {
        const res = await authFetch(
          `http://${API_HOST}:8000/api/acesso/processamento/`
        );

        if (!res) return;

        const data = await res.json();
        
        if (data?.[0]?.status === "ERRO") {
          setEstaBloqueado(true);
          setLoading(false);
          setMensagem("Erro no processamento");
          return;
        }

        if (data && Object.keys(data).length > 0) {
          setEstaBloqueado(true);
          setLoading(true);
        } else {
          setEstaBloqueado(false);
          setLoading(false);
          setMensagem("Página pronta para novo upload");
        }
      } catch (error) {
        console.error(error);
      }
    };

    verificarProcessamento();
    const interval = setInterval(verificarProcessamento, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBuscar = async () => {
    try {
      setBloqueado(true);

      setTimeout(() => {
        window.location.reload();
      }, 127000);
    } catch (error) {
      console.error(error);
      setBloqueado(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `http://${API_HOST}:8000/api/acesso/upload-xls/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("access");
          window.location.replace("/login");
          return;
        }

        const erro = await response.json();
        console.log(erro);

        throw new Error("Erro no upload");
      }

      setMensagem("Processamento sendo feito...");
      setLoading(true);

    } catch (error) {
      console.error(error);
      setMensagem("Erro no upload.");
      setEstaBloqueado(false);
    }
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
                  
                  {mensagem && <p className="mt-3 mb-0">{mensagem}</p>}
                </div>

                <div className="card-footer d-flex justify-content-center">
                  <button className="btn btn-outline-secondary" onClick={() => {handleBuscar(); buscarRegistro();}} disabled={bloqueado}>
                    <i className="fas fa-sync-alt me-2"></i>
                    {bloqueado ? "Buscando registros..." : "Buscar registros dos últimos 5 minutos"}
                  </button>
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