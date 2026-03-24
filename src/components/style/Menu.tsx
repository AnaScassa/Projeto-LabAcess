import { Link } from "react-router-dom";

export default function BotaoVoltar() {
    return (
    <div>
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" data-widget="pushmenu" href="#">☰</a>
          </li>
        </ul>
        <span className="ml-3 font-weight-bold">Controle do Laboratório</span>
    </nav>

    <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="#" className="brand-link d-flex align-items-center">
            <span className="brand-text font-weight-light tituloMenu">Relatórios</span>
            <button className="btn btn-link p-0 text-white ml-auto d-lg-none" data-widget="pushmenu" style={{ fontSize: "18px", margin: "5px 10px 0 0" }}>✕</button>
        </a>

        <div className="sidebar">
            <nav className="mt-2">
                <ul className="nav nav-pills nav-sidebar flex-column">
                    <li className="nav-item">
                        <Link to="/Upload" className="nav-link">
                        <i className="fas fa-upload"></i>
                        <p>Upload de Planilha</p>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/RelatorioTempo" className="nav-link">
                        <i className="fas fa-chart-line"></i>
                        <p>Tempo de Acesso</p>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/tempoPermanencia" className="nav-link">
                        <i className="fas fa-clock"></i>
                        <p>Tempo de Permanência</p>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/naoAcessantes" className="nav-link">
                        <i className="fas fa-user-slash"></i>
                        <p>Não Acessantes</p>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/relatorioRecente" className="nav-link">
                        <i className="fas fa-calendar-alt"></i>
                        <p>Último Mês</p>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/relatorioTreinamento" className="nav-link">
                        <i className="fas fa-exclamation-triangle"></i>
                        <p>Treinamentos Expirados</p>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/relatorioNaoExpirados" className="nav-link">
                        <i className="fas fa-check-circle"></i>
                        <p>Treinamentos Ativos</p>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    </aside>
    </div>
    );
}