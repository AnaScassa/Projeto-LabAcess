import { TailSpin } from "react-loader-spinner";
import { useState, useEffect } from "react";
import { authFetch } from "../services/auth";
import GraficoAcessos from "../components/graficos/Acessos";
import GraficosUsuariosAtivos from "../components/graficos/UsuariosAtivos";
import Menu from "../components/style/Menu";

export default function Upload() {
  const [mensagem, setMensagem] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [estaBloqueado, setEstaBloqueado] = useState<boolean>(false);

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
          "http://localhost:8000/api/acesso/processamento/"
        );

        if (!res) return;

        const data = await res.json();

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

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    setEstaBloqueado(true);
    e.preventDefault();

    if (!token) {
      setMensagem("Sessão expirada. Faça login novamente.");
      window.location.replace("/login");
      return;
    }

    const fileInput = document.getElementById("fileInput") as HTMLInputElement;

    if (!fileInput.files || !fileInput.files[0]) {
      setMensagem("Selecione um arquivo primeiro!");
      return;
    }

    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8000/api/acesso/upload-xls/",
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
        throw new Error("Erro");
      }

      setMensagem("Processamento sendo feito...");
      setLoading(true);
      setEstaBloqueado(false);
    } catch (error) {
      setMensagem("Erro no upload.");
    }
  };

  return (
    <div className="wrapper">
      <Menu/>

      <div className="content-wrapper">
        <section className="content p-4">

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Upload de Planilha Excel</h3>
            </div>

            <div className="card-body text-center">

              <form onSubmit={handleUpload}>
                <input type="file" id="fileInput" accept=".xls,.xlsx" />
                <br /><br />
                <button className="btn btn-primary" type="submit" disabled={estaBloqueado} style={{minWidth: "130px"}}>
                  {estaBloqueado ? "Enviando..." : "Enviar"}
                </button>
              </form>
                {loading && (
                  <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center", height: "100px" }}>
                    <TailSpin height="50" width="50" color="#007bff" />
                  </div>
                )}
                <p className="mt-3">{mensagem}</p>
            </div>
          </div>

        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="row">

              <div className="col-md-6">
                <div className="card card-primary">
                  <div className="card-header">
                    <h3 className="card-title">Acessos por Mês</h3>
                  </div>

                  <div className="card-body" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GraficoAcessos />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card card-success">
                  <div className="card-header">
                    <h3 className="card-title">Usuários que mais acessam o lab</h3>
                  </div>

                  <div className="card-body" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GraficosUsuariosAtivos />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}