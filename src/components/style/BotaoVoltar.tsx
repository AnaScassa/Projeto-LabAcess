import { Link } from "react-router-dom";

export default function BotaoVoltar() {
    return (
        <Link to="/upload">
            <button style={{ margin: "0 20px 20px 0" }}>
                Voltar
            </button>
        </Link>
    );
}