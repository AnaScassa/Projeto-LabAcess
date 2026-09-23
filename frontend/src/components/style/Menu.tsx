import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../../public/logo2.png";

export default function BotaoVoltar() {
    const { username } = useAuth();
    const [relatoriosAberto, setRelatoriosAberto] = useState(true);
    const [treinamentoAberto, setTreinamentoAberto] = useState(true);
    const location = useLocation();
    const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);

    const isActive = (path: string) => location.pathname === path;

    return (
    <div>
        <nav className="main-header navbar navbar-expand navbar-white navbar-light">
            <ul className="navbar-nav">
                <li className="nav-item">
                    <a className="nav-link" data-widget="pushmenu" href="#">☰</a>
                </li>
            </ul>

            <span className="ml-3 nav-link" style={{color: "rgba(0, 0, 0, .5)"}}>
                {username ? `Olá, ${username}` : "ControleLab"}
            </span>

            <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                    <button className="nav-link border-0 bg-primary d-flex align-items-center justify-content-center" onClick={() => 
                        setNotificacoesAtivas(!notificacoesAtivas)} title={notificacoesAtivas ? "Desativar notificações" : "Ativar notificações"} 
                        style={{width: "40px", height: "40px", borderRadius: "6px"}}>
                            <span style={{position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center"}}>
                                <i className="fas fa-bell text-white mr-0" style={{fontSize: "18px"}}></i>
                                <span style={{position: "absolute", width: "24px", height: "3px", background: "#fff", border: "1px solid #757575", borderRadius: "2px", 
                                    transform: "rotate(-45deg) scaleX(1)", transformOrigin: "center", opacity: notificacoesAtivas ? 0 : 1, 
                                    transition: "opacity 0.25s ease"}}>
                                </span>
                            </span>
                    </button>
                </li>
            </ul>
        </nav>
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
            <div className="brand-link d-flex align-items-center px-3" style={{minHeight: "70px", position: "relative"}}>
                <img src={logo} alt="Logo CCS" style={{width: "40px", height: "40px", objectFit: "contain", flexShrink: 0}} />
                <span className="brand-text font-weight-light tituloMenu ml-1" style={{whiteSpace: "nowrap"}}>
                    ControleLab
                </span>
                <button className="btn btn-link p-0 text-white d-lg-none position-absolute" data-widget="pushmenu" 
                    style={{fontSize: "18px", right: "15px", top: "50%", transform: "translateY(-50%)"}}>
                        ✕
                </button>
            </div>

            <div className="sidebar">
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column">
                        <li className="nav-item">
                            <Link to="/" className={`nav-link ${isActive("/") ? "active bg-white text-dark" : ""}`}>
                                <i className="fas fa-upload mr-0 ml-1"></i>
                                <p className="ml-1">Upload de Planilha</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active bg-white text-dark" : ""}`}>
                                <i className="fas fa-chart-line mr-0 ml-1"></i>
                                <p className="ml-1">Dashboard</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/email" className={`nav-link ${isActive("/email") ? "active bg-white text-dark" : ""}`}>
                                <i className="fas fa-sharp fa-solid fa-envelope mr-0 ml-1"></i>
                                <p className="ml-1">Controle de Emails</p>
                            </Link>
                        </li>
                        <li className={`nav-item ${relatoriosAberto ? "menu-open" : ""}`}>
                            <a href="#" className="nav-link active" onClick={(e) =>{e.preventDefault(); setRelatoriosAberto(!relatoriosAberto);}}>
                                <i className="nav-icon fas fa-file-alt"></i>
                                <p>Relatórios
                                    <i className="right fas fa-angle-left" 
                                    style={{transform: relatoriosAberto ? "rotate(-90deg)" : "rotate(0deg)",transition: "transform 0.5s ease"}}></i>
                                </p>
                            </a>

                            <ul className={`nav nav-treeview ${relatoriosAberto ? "submenu-open" : ""}`} style={{display: "block"}}>
                                <li className="nav-item">
                                    <Link to="/tempoPermanencia" className={`nav-link ${isActive("/tempoPermanencia") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Tempo de Permanência</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/naoAcessantes" className={`nav-link ${isActive("/naoAcessantes") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Não Acessantes Lab</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/RelatorioTempo" className={`nav-link ${isActive("/RelatorioTempo") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Tempo de Acesso Total</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/relatorioRecente" className={`nav-link ${isActive("/relatorioRecente") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Último Mês Lab</p>
                                    </Link>
                                </li>  
                            </ul>
                        </li>
                        
                        <li className={`nav-item ${treinamentoAberto ? "menu-open" : ""}`}>
                            <a href="#" className="nav-link active" onClick={(e) =>{e.preventDefault(); setTreinamentoAberto(!treinamentoAberto);}}>
                                <i className="fas fa-chalkboard-teacher"></i>
                                <p>Treinamentos
                                    <i className="right fas fa-angle-left" 
                                    style={{transform: treinamentoAberto ? "rotate(-90deg)" : "rotate(0deg)",transition: "transform 0.5s ease"}}></i>
                                </p>
                            </a>

                            <ul className={`nav nav-treeview ${treinamentoAberto ? "submenu-open" : ""}`} style={{display: "block"}}>
                            <li className="nav-item">
                                    <Link to="/relatorioTreinamento" className={`nav-link ${isActive("/relatorioTreinamento") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Expirados</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/relatorioNaoExpirados" className={`nav-link ${isActive("/relatorioNaoExpirados") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Ativos</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/relatorioTreinamentoPendente" className={`nav-link ${isActive("/relatorioTreinamentoPendente") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Pendentes Treinados</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/TreinamentosPendentesNaoTreinados" className={`nav-link ${isActive("/TreinamentosPendentesNaoTreinados") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Alunos Não Treinados</p>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    </div>
    );
}