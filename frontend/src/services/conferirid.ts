import { SMARTCARD_API_BASE } from "../utils/static";

export async function verificarId(userId: string) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${SMARTCARD_API_BASE}/api/acesso/verificar-id/${userId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();

  return {status: response.status, data,};
  
}