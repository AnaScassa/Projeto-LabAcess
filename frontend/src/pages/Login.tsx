import { useState } from "react";
import { fazerLogin } from "../services/login";
import { registrarEmail } from "../services/email";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fazerLogin(username, password);

      if (!response.ok) {
        setMensagem("Usuário ou senha inválidos");
        return false;
      }

      const data = await response.json();

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("id", String(data.id));
      localStorage.setItem("username", username);

      if (data.email) {
        localStorage.setItem("email", data.email);
      }

      return true;

    } catch (error) {
      console.error(error);
      setMensagem("Erro ao conectar com o servidor");
      return false;
    }
  };

  const handleEmail = async () => {
    try {
      const response = await registrarEmail();

      if (!response.ok) {
        const erro = await response.text();
        console.error("Erro ao registrar email:", erro);
        return false;
      }

      return true;

    } catch (error) {
      console.error("Erro ao registrar email:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const loginSucesso = await handleLogin();

    if (!loginSucesso) {
      return;
    }

    await handleEmail();

    window.location.replace("/");
  };

  return (
    <div className="login-page" style={{ minHeight: "100vh" }}>
      <div className="login-box">

        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <h3>
              <b>Controle</b>Lab
            </h3>
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
                  <button type="submit" className="btn btn-primary btn-block">Entrar</button>
                </div>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
