import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {    
    e.preventDefault();

    try {
      const response = await fetch(
        "http://143.106.5.41:8000/api/acesso/login/",
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

      console.log("ACCESS:", data.access);
      console.log("REFRESH:", data.refresh);

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      console.log("LS ACCESS:", localStorage.getItem("access"));
      console.log("LS REFRESH:", localStorage.getItem("refresh"));

      window.location.replace("/");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao conectar com o servidor");
    }

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

            <form onSubmit={handleLogin}>

              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-user"></span>
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
