import { authFetch } from "./auth";
import { SMARTCARD_API_BASE } from "../utils/static";

export const listaEmails = async () => {
    return await authFetch(`${SMARTCARD_API_BASE}/api/acesso/lista-emails/`);
};

export const registroEmails = async () => {
    return await authFetch(`${SMARTCARD_API_BASE}/api/acesso/registro-emails/`);
};

export const cadastrarEmail = async (email: string) => {
    return await authFetch(`${SMARTCARD_API_BASE}/api/acesso/cadastrar-email/`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
};

export const desativarEmail = async (id: number) => {
    return await authFetch(`${SMARTCARD_API_BASE}/api/acesso/desativar-emails/${id}/`, {
      method: "PATCH",
    });
};

export async function registrarEmail() {
  const token = localStorage.getItem("access");

  if (!token) {
    throw new Error("Token não encontrado");
  }

  return fetch(`${SMARTCARD_API_BASE}/api/acesso/registrar-email/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
}
