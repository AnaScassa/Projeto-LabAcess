import { Link } from "react-router-dom";

export default function BotaoVoltar() {
    return (
        <Link to="/upload">
            <button className="btn btn-primary" style={{ margin: "0 20px 20px 0" }}>
            <i className="fas fa-sharp fa-angle-left" style={{marginRight: "15px"}}></i>
                Voltar
            </button>
        </Link>
    );
}