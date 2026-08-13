import { authFetch } from "./auth";
import { API_HOST } from "../utils/static";

export const listaEmails = async () => {
    return await authFetch(`http://${API_HOST}:8000/api/acesso/lista-emails`);
};

export const cadastrarEmail = async (email: string) => {
    return await authFetch(`http://${API_HOST}:8000/api/acesso/cadastrar-email/`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
};

export const desativarEmail = async (id: number) => {
    return await authFetch(`http://${API_HOST}:8000/api/acesso/desativar-emails/${id}/`, {
      method: "PATCH",
    });
};

export const registrarEmail = async (email: string) => {
    return await fetch(`http://${API_HOST}:8000/api/acesso/registrar-email/`,{
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
};