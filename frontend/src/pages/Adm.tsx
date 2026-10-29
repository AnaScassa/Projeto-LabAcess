import { useState, type FormEvent } from "react";
import Menu from "../components/style/Menu";
import EmailsAdmin from "../components/adm/EmailsAdmin";
import UsuariosAdmin from "../components/adm/UsuariosAdmin";
import UsuariosUsersServiceAdmin from "../components/adm/UsuariosUsersServiceAdmin";
import ConfiguracoesAdmin from "../components/adm/ConfiguracoesAdmin";
import { conferirStaff } from "../services/users";

export default function Adm() {
  const [secaoAtiva, setSecaoAtiva] = useState<"usuarios" | "users_service" | "emails" | "configuracoes" | null>(null);
  const [password, setPassword] = useState("");
  const [statusStaff, setStatusStaff] = useState<"formulario" | "verificando" | "autorizado" | "negado" | "erro">("formulario");
  const [erroStaff, setErroStaff] = useState<string | null>(null);

  async function verificarPermissaoStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (statusStaff === "verificando") return;

    setStatusStaff("verificando");
    setErroStaff(null);
    try {
      const isStaff = await conferirStaff(password);
      setPassword("");
      setStatusStaff(isStaff ? "autorizado" : "negado");
    } catch (error) {
      setPassword("");
      setErroStaff(error instanceof Error ? error.message : "Não foi possível verificar a permissão.");
      setStatusStaff("erro");
    }
  }

  if (statusStaff !== "autorizado") {
    return (
      <div className="wrapper">
        <Menu />
        <div className="content-wrapper">
          <section className="content p-3 p-md-4 d-flex align-items-center justify-content-center" style={{ minHeight: "calc(100vh - 64px)" }}>
            <div className="card border-0 rounded-4 shadow-lg overflow-hidden w-100" style={{ maxWidth: "500px" }}>
              <div className="text-center px-4 pt-4 pb-3" style={{ background: "linear-gradient(135deg, #f1f7ff 0%, #ffffff 100%)" }}>
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: "68px", height: "68px", backgroundColor: "#e5efff", color: "#0d6efd" }}
                >
                  <i className="fas fa-shield-alt mr-0" style={{ fontSize: "28px" }} aria-hidden="true"></i>
                </div>
                <span className="d-block text-primary text-uppercase small font-weight-bold mb-2" style={{ letterSpacing: "1.5px" }}>
                  Verificação de segurança
                </span>
                <h4 className="font-weight-bold text-dark mb-2">Confirme sua identidade</h4>
                <p className="text-muted mb-0">Digite sua senha para liberar as ferramentas administrativas.</p>
              </div>

              <div className="card-body px-4 px-md-5 pt-4 pb-4">
                <form onSubmit={verificarPermissaoStaff}>
                  <div className="form-group mb-3">
                    <label className="form-label font-weight-semibold text-dark" htmlFor="adm-password">Senha da sua conta</label>
                    <div className="input-group">
                      <input id="adm-password" type="password" className="form-control" placeholder="Digite sua senha" autoComplete="current-password"
                        value={password} onChange={(event) => setPassword(event.target.value)} required disabled={statusStaff === "verificando"}
                      />
                      <div className="input-group-append">
                        <span className="input-group-text bg-white text-muted">
                          <i className="fas fa-lock" aria-hidden="true"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  {statusStaff === "verificando" && (
                    <div className="alert alert-info d-flex align-items-center py-2" role="status">
                      <i className="fas fa-circle-notch fa-spin mr-2" aria-hidden="true"></i>
                      Verificando sua senha...
                    </div>
                  )}
                  {statusStaff === "negado" && (
                    <div className="alert alert-danger py-2" role="alert">
                      Esta conta não tem permissão para acessar a área administrativa.
                    </div>
                  )}
                  {statusStaff === "erro" && erroStaff && (
                    <div className="alert alert-danger py-2" role="alert">{erroStaff}</div>
                  )}
                  <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm mt-2" disabled={statusStaff === "verificando"}>
                    {statusStaff === "verificando" ? "Verificando..." : (
                      <>
                        <i className="fas fa-unlock-alt mr-2" aria-hidden="true"></i>
                        Acessar administração
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <Menu/>
      <div className="content-wrapper">
        <section className="content-header px-3 px-md-4 pt-4 pb-2">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div>
            <h1 className="font-weight-bold text-dark mb-1" style={{ fontSize: "26px" }}>
              <i className="fas fa-user-cog mr-2 text-primary" aria-hidden="true"></i>
              Administração
            </h1>
            <p className="text-muted mb-0">Gerencie as configurações e os recursos do sistema.</p>
          </div>
          <span className="badge badge-info px-3 py-2 mt-3 mt-md-0 bg-primary " style={{fontSize: "12px"}}>
            <i className="fas fa-user-shield mr-2"></i> Painel administrativo
          </span>
        </div>
      </section>

      <section className="content px-3 px-md-4 pt-3 pb-4">
        <div className="row">
          <div className="col-12 col-sm-6 col-xl-3 mb-3">
            <div className="card border-0 rounded-lg shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="d-flex align-items-center justify-content-center mr-2 flex-shrink-0" style={{ width: "40px", height: "40px", backgroundColor: "rgba(23, 162, 184, 0.12)", borderRadius: "10px" }}>
                    <i className="fas fa-users mr-0" style={{ color: "#17a2b8", fontSize: "18px" }}></i>
                  </div>
                  <div>
                    <h6 className="font-weight-bold text-dark mb-1">Usuários SmartCard</h6>
                    <small className="text-muted">Gerenciamento de usuários</small>
                  </div>
                </div>
                <p className="text-muted small mb-2">Consulte e gerencie os usuários cadastrados no sistema.</p>
                <button type="button" className="btn btn-outline-info btn-sm" style={{ borderColor: "#17a2b8" }} onClick={() => setSecaoAtiva("usuarios")}>
                  <i className="fas fa-arrow-right mr-0"></i> Acessar
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3 mb-3">
            <div className="card border-0 rounded-lg shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="d-flex align-items-center justify-content-center mr-2 flex-shrink-0" style={{ width: "40px", height: "40px", 
                    backgroundColor: "rgba(0, 123, 255, 0.12)", borderRadius: "10px" }}>
                    <i className="fas fa-user-friends mr-0" style={{ color: "#007bff", fontSize: "18px" }}></i>
                  </div>
                  <div>
                    <h6 className="font-weight-bold text-dark mb-1">Usuarios Users_Service</h6>
                    <small className="text-muted">Contas do serviço de usuários</small>
                  </div>
                </div>
                <p className="text-muted small mb-2">Consulte a lista de usuários cadastrados no Users_Service.</p>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setSecaoAtiva("users_service")}>
                  <i className="fas fa-arrow-right mr-0"></i> Acessar
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3 mb-3">
            <div className="card border-0 rounded-lg shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="d-flex align-items-center justify-content-center mr-2 flex-shrink-0" style={{ width: "40px", height: "40px", 
                    backgroundColor: "rgba(255, 193, 7, 0.15)", borderRadius: "10px" }}>
                    <i className="fas fa-envelope mr-0" style={{ color: "#d39e00", fontSize: "18px" }}></i>
                  </div>
                  <div>
                    <h6 className="font-weight-bold text-dark mb-1">E-mails</h6>
                    <small className="text-muted">Configuração de destinatários</small>
                  </div>
                </div>
                <p className="text-muted small mb-2">Gerencie os e-mails que recebem notificações do sistema.</p>
                <button type="button" className="btn btn-outline-warning btn-sm" onClick={() => setSecaoAtiva("emails")}>
                  <i className="fas fa-arrow-right mr-0"></i> Acessar
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3 mb-3">
            <div className="card border-0 rounded-lg shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="d-flex align-items-center justify-content-center mr-2 flex-shrink-0" style={{ width: "40px", height: "40px", 
                    backgroundColor: "rgba(40, 167, 69, 0.12)", borderRadius: "10px" }}>
                    <i className="fas fa-cogs mr-0" style={{ color: "#28a745", fontSize: "18px" }}></i>
                  </div>
                  <div>
                    <h6 className="font-weight-bold text-dark mb-1">Configurações</h6>
                    <small className="text-muted">Parâmetros do sistema</small>
                  </div>
                </div>
                <p className="text-muted small mb-2">Consulte as opções de configuração e administração.</p>
                <button type="button" className="btn btn-outline-success btn-sm" onClick={() => setSecaoAtiva("configuracoes")}>
                  <i className="fas fa-arrow-right mr-0"></i> Acessar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 rounded-lg shadow-sm">
          <div className="card-header bg-white border-bottom px-4 py-3">
            <div className="d-flex align-items-center">
              <i className="fas fa-sliders-h mr-2 text-primary" style={{fontSize: "18px" }}></i>
              <h6 className="font-weight-bold text-dark mb-0">Central de administração</h6>
            </div>
          </div>
          <div className="card-body p-4">
            {secaoAtiva === null ? (
              <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
                <div className="d-flex align-items-center justify-content-center mb-3" style={{ width: "64px", height: "64px", 
                  backgroundColor: "rgba(23, 162, 184, 0.10)", borderRadius: "50%" }}>
                  <i className="fas fa-tools mr-0" style={{ color: "#17a2b8", fontSize: "27px" }}></i>
                </div>
                <h5 className="font-weight-bold text-dark mb-2">Área administrativa</h5>
                <p className="text-muted mb-0" style={{ maxWidth: "420px" }}>
                  Selecione uma das opções acima para acessar as funcionalidades administrativas do LabAcess.
                </p>
              </div>
            ) : secaoAtiva === "emails" ? (
              <EmailsAdmin />
            ) : secaoAtiva === "usuarios" ? (
              <UsuariosAdmin />
            ) : secaoAtiva === "users_service" ? (
              <UsuariosUsersServiceAdmin />
            ) : (
              <ConfiguracoesAdmin />
            )}
          </div>
        </div>
      </section>
    </div>
    </div>
  );
}
