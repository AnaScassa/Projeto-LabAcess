import { Link } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { useState, useEffect } from "react";

export default function Upload() {
  const [mensagem, setMensagem] = useState("");
  const [token, setToken] = useState<string | null>(null);  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("access");

    if (!storedToken) {
      window.location.replace("/login");
      return;
    }

    setToken(storedToken);
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {    
    e.preventDefault();

    if (!token) {
      setMensagem("Sessão expirada. Faça login novamente.");
      window.location.replace("/login");
      return;
    }

    const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;

    if (!fileInput || !fileInput.files) return;

    const file = fileInput.files[0];

    if (!file) {
      setMensagem("Selecione um arquivo primeiro!");
      return;
    }

    setLoading(true);
    setMensagem("");
    setData(null);

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

      await new Promise(resolve => setTimeout(resolve, 3000));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("access");
          window.location.replace("/login");
          return;
        }
        throw new Error("Erro ao enviar arquivo");
      }

      setMensagem("Upload realizado com sucesso!");
    } catch (error) {
      setMensagem("Erro no upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <center>
      <h2>Upload de planilha Excel</h2>

      <form onSubmit={handleUpload}>
      <input type="file" id="fileInput" accept=".xls,.xlsx" />
        <br /><br />
        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>

        <div
        className="data-container"
        style={{
          marginTop: loading ? "20px" : "0px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: loading ? "80px" : "0px",
        }}
      >
        {loading ? (
          <TailSpin
            height="50"
            width="50"
            color="#ffffff"
            ariaLabel="loading-spinner"
          />
        ) : (
          data && <div>{data}</div>
        )}
      </div>


      <p>{mensagem}</p>

      <br />
      <p>Rotas para páginas:</p>

      <Link to="/usuarios"><button>Usuário</button></Link>
      <Link to="/listagem"><button>Listagem</button></Link>
      <Link to="/tempoPermanencia"><button>Tempo Permanência</button></Link>
    </center>
  );
}
