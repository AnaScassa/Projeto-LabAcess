import { useState } from "react";
import { API_HOST } from "../utils/static";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://${API_HOST}:8000/api/acesso/registrar-email/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: username }),
        }
      );
      
      const data = await response.json();
      console.log("Email registrado:", data);
    } catch (error) {
      console.error("Erro ao registrar email:", error);
      setMensagem("Erro ao conectar com o servidor");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {    
    e.preventDefault();

    try {
      const response = await fetch(`http://${API_HOST}:8001/api/users/api/token/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!response.ok) {
        setMensagem("Usuário ou senha inválidos");
        return;
      }

      const data = await response.json();
      
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("username", username);

      window.location.replace("/");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao conectar com o servidor");
    }

  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleEmail(e);
    await handleLogin(e);
  };

  return (
    <div className="login-page" style={{ minHeight: "100vh" }}>
      <div className="login-box">

        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <h3><b>Controle</b>Lab</h3>
          </div>

          <div className="card-body">
            <p className="login-box-msg">Faça login para continuar</p>

            <form onSubmit={handleSubmit}>

              <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-user"></span>
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input type="password" className="form-control" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock"></span>
                  </div>
                </div>
              </div>

              {mensagem && (
                <div className="alert alert-danger text-center p-2">
                  {mensagem}
                </div>
              )}

              <div className="row">
                <div className="col-12">
                  <button type="submit" className="btn btn-primary btn-block">
                    Entrar
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
