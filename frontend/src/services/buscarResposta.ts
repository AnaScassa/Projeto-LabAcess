import { API_HOST } from "../utils/static";

export async function buscarUltimaResposta() {
    const token = localStorage.getItem("access");

    const response = await fetch(`http://${API_HOST}:8000/api/acesso/ultima-resposta/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao buscar última resposta");
    }

    return response.json();
}