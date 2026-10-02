import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export const apagarNotificacoesUsuario = async () => {
    const response = await authFetch(`http://${API_HOST}:8000/api/acesso/notificacoes/`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
    }

    return response.json();
};