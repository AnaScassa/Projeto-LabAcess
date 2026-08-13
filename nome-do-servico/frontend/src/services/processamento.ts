import { API_HOST } from "../utils/static";
import { authFetch } from "./auth";

export const verificarProcessamento = async () => {
    try {
        const res = await authFetch(`http://${API_HOST}:8000/api/acesso/processamento/`);

        if (!res) return null;

        return await res.json();
        
    } catch (error) {
        console.error(error);
        return null;
    }
};