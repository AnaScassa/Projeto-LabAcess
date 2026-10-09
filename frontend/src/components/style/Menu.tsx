import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { buscarNotificacoesUsuario } from "../../services/buscarNotificacoesUsuario";
import { apagarNotificacoesUsuario } from "../../services/apagarNotificacoesUsuario";
import logo from "../../../public/logo2.png";

type NotificacaoUsuario = {
    id: number;
    lida: boolean;
    acesso: {
        id: number;
        nome_usuario: string;
        matricula: string;
        data: string;
        hora: string;
        porta: string;
        mensagem: string;
    } | null;
};

export default function BotaoVoltar() {
    const { username } = useAuth();
    const [relatoriosAberto, setRelatoriosAberto] = useState(true);
    const [treinamentoAberto, setTreinamentoAberto] = useState(true);
    const location = useLocation();
    const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
    const [notificacoes, setNotificacoes] = useState<NotificacaoUsuario[]>([]);
    const [carregandoNotificacoes, setCarregandoNotificacoes] = useState(false);
    const [apagandoNotificacoes, setApagandoNotificacoes] = useState(false);
    const [erroNotificacoes, setErroNotificacoes] = useState(false);

    const isActive = (path: string) => location.pathname === path;
    const notificacoesNaoLidas = notificacoes.filter((notificacao) => !notificacao.lida).length;

    useEffect(() => {
        let ativo = true;

        buscarNotificacoesUsuario().then((resultado: NotificacaoUsuario[]) => {
            if (ativo) setNotificacoes(resultado);
        }).catch(() => {
            if (ativo) setNotificacoes([]);
        });

        return () => {
            ativo = false;
        };
    }, []);

    const apagarNotificacoes = async () => {
        if (notificacoes.length === 0 || !window.confirm("Tem certeza que deseja apagar todas as notificações?")) {
            return;
        }

        setApagandoNotificacoes(true);
        setErroNotificacoes(false);

        try {
            await apagarNotificacoesUsuario();
            setNotificacoes([]);
        } catch {
            setErroNotificacoes(true);
        } finally {
            setApagandoNotificacoes(false);
        }
    };

    const alternarNotificacoes = async () => {
        if (notificacoesAbertas) {
            setNotificacoesAbertas(false);
            return;
        }

        setNotificacoesAbertas(true);
        setCarregandoNotificacoes(true);
        setErroNotificacoes(false);

        try {
            const resultado = await buscarNotificacoesUsuario();
            setNotificacoes(resultado);
        } catch {
            setErroNotificacoes(true);
        } finally {
            setCarregandoNotificacoes(false);
        }
    };

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
                <li className="nav-item position-relative">
                    <button className="nav-link border-0 bg-primary d-flex align-items-center justify-content-center notification-trigger" 
                        onClick={alternarNotificacoes} aria-expanded={notificacoesAbertas} aria-label="Abrir notificações" title="Notificações">
                            <i className="fas fa-bell text-white mr-0" style={{fontSize: "18px"}}></i>
                            {notificacoesNaoLidas > 0 && (
                                <span className="notification-badge" aria-label={`${notificacoesNaoLidas} não lidas`}>
                                    {notificacoesNaoLidas}
                                </span>
                            )}
                    </button>

                    {notificacoesAbertas && (
                        <div className="notification-popover">
                            <div className="notification-popover-header">
                                <h6>Notificações</h6>
                                <button type="button" aria-label="Fechar notificações" onClick={() => setNotificacoesAbertas(false)}>
                                    <i className="fas fa-times" aria-hidden="true"></i>
                                </button>
                            </div>

                            <div className="notification-list">
                                {carregandoNotificacoes ? (
                                    <div className="notification-message">
                                        <span>Carregando notificações...</span>
                                    </div>
                                ) : erroNotificacoes ? (
                                    <div className="notification-message">
                                        <span>Não foi possível carregar as notificações.</span>
                                    </div>
                                ) : notificacoes.length === 0 ? (
                                    <div className="notification-message">
                                        <span>Nenhuma notificação.</span>
                                    </div>
                                ) : notificacoes.map((notificacao) => (
                                    <article key={notificacao.id} className={`notification-row ${notificacao.lida ? "" : "notification-row-unread"}`}>
                                        <div className="notification-avatar">
                                            <i className="fas fa-exclamation" aria-hidden="true"></i>
                                        </div>
                                        <div className="notification-row-content">
                                            <p className="notification-row-title">
                                                {notificacao.acesso?.mensagem || "Acesso para verificação"}
                                            </p>
                                            {notificacao.acesso ? (
                                                <>
                                                    <p className="notification-row-detail">
                                                        {notificacao.acesso.nome_usuario} (matrícula {notificacao.acesso.matricula})
                                                    </p>
                                                    <p className="notification-row-detail">
                                                        {notificacao.acesso.data} às {notificacao.acesso.hora} · Porta {notificacao.acesso.porta}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="notification-row-detail">Acesso relacionado indisponível.</p>
                                            )}
                                        </div>
                                        {!notificacao.lida && <span className="notification-unread-dot" aria-label="Não lida" />}
                                    </article>
                                ))}
                            </div>
                            <div className="notification-popover-footer">
                                <button type="button" onClick={apagarNotificacoes} disabled={notificacoes.length === 0 || carregandoNotificacoes || apagandoNotificacoes}>
                                    <i className={`fas ${apagandoNotificacoes ? "fa-spinner fa-spin" : "fa-trash-alt"}`} aria-hidden="true"></i>
                                    {apagandoNotificacoes ? "Apagando..." : "Apagar notificações"}
                                </button>
                            </div>
                        </div>
                    )}
                </li>
            </ul>
        </nav>
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
            <div className="brand-link d-flex align-items-center px-3" style={{minHeight: "70px", position: "relative"}}>
                <img src={logo} alt="Logo CCS" style={{width: "40px", height: "40px", objectFit: "contain", flexShrink: 0}} />
                <span className="brand-text font-weight-light tituloMenu ml-1" style={{whiteSpace: "nowrap"}}>ControleLab</span>
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
                        <li className="nav-item">
                            <Link to="/agendamento" className={`nav-link ${isActive("/agendamento") ? "active bg-white text-dark" : ""}`}>
                                <i className="fas fa-calendar-alt mr-0 ml-1"></i>
                                <p className="ml-1">Agendamento</p>
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
                                    <Link to="/tempo-permanencia" className={`nav-link ${isActive("/tempo-permanencia") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Tempo de Permanência</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/nao-acessantes" className={`nav-link ${isActive("/nao-acessantes") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Não Acessantes Lab</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/relatorio-tempo" className={`nav-link ${isActive("/relatorio-tempo") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Tempo de Acesso Total</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/relatorio-recente" className={`nav-link ${isActive("/relatorio-recente") ? "active bg-white text-dark" : ""}`}>
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
                                    <Link to="/relatorio-treinamento" className={`nav-link ${isActive("/relatorio-treinamento") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Expirados</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/relatorio-nao-expirados" className={`nav-link ${isActive("/relatorio-nao-expirados") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Ativos</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/relatorio-treinamento-pendente" className={`nav-link ${isActive("/relatorio-treinamento-pendente") ? "active bg-white text-dark" : ""}`}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Pendentes Treinados</p>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link to="/relatorio-treinamentos-pendentes-nao-treinados" className={`nav-link ${isActive("/relatorio-treinamentos-pendentes-nao-treinados") ? "active bg-white text-dark" : ""}`}>
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