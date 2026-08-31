import { API_HOST } from "../utils/static";

export async function verificarId(userId: string) {
  const token = localStorage.getItem("access");

  const response = await fetch(`http://${API_HOST}:8000/api/acesso/verificar-id/${userId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();

  return {status: response.status, data,};
  
}