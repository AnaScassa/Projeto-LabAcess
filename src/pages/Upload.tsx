import { Link } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { useState, useEffect } from "react";
import { authFetch } from "../services/auth";

export default function Upload() {
  const [mensagem, setMensagem] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          setLoading(true);
        } else {
          setLoading(false);
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
        throw new Error("Erro ao enviar arquivo");
      }

      setMensagem("Arquivo enviado, processamento sendo feito");

      setLoading(true);

    } catch (error) {
      setMensagem("Erro no upload.");
    }
  };

  return (
    <center>
      <h2>Upload de planilha Excel</h2>

      <form onSubmit={handleUpload}>
        <input type="file" id="fileInput" accept=".xls,.xlsx" />
        <br /><br />
        <button type="submit">
          Enviar
        </button>
      </form>
      <center>
      {loading && (
        <div style={{ marginTop: "20px" }}>
          <TailSpin
            height="50"
            width="50"
            color="#ffffff"
            ariaLabel="loading-spinner"
          />
        </div>
      )}
      </center>

      <p>{mensagem}</p>

      <br />
      <p>Rotas para páginas:</p>

      <Link to="/usuarios"><button>Usuário</button></Link>
      <Link to="/listagem"><button>Listagem</button></Link>
      <Link to="/tempoPermanencia"><button>Tempo Permanência</button></Link>
    </center>
  );
}