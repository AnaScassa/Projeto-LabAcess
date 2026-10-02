import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export const buscarNotificacoesUsuario = async () => {
    const response = await authFetch(`http://${API_HOST}:8000/api/acesso/notificacoes/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
    }

    return response.json();
};