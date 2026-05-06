import { API_HOST } from "../utils/static";

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("access");

  if (!token) {
    throw new Error("Sem token");
  }

  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    const refresh = localStorage.getItem("refresh");

    if (!refresh) {
      throw new Error("Sem refresh token");
    }

    const refreshResponse = await fetch(
      `http://${API_HOST}:8001/api/users/api/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      }
    );

    if (!refreshResponse.ok) {
      throw new Error("Refresh inválido");
    }

    const data: { access: string } = await refreshResponse.json();

    localStorage.setItem("access", data.access);

    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${data.access}`,
      },
    });
  }

  return response;
}