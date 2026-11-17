import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export const apagarNotificacoesUsuario = async () => {
    const response = await authFetch(`${SMARTCARD_API_BASE}/api/acesso/notificacoes/`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
    }

    return response.json();
};