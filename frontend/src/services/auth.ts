import { API_HOST } from "../utils/static";

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.id ? String(payload.id) : null;
  } catch {
    return null;
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = localStorage.getItem("access");

  if (!token) {
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("Sem token");
  }

  const makeRequest = async (accessToken: string) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401 || response.status === 403) {

    const refresh = localStorage.getItem("refresh");

    if (!refresh) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Sem refresh token");
    }

    const refreshResponse = await fetch(`http://${API_HOST}:8000/api/users/api/token/refresh/`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh,
      }),
    });

    if (!refreshResponse.ok) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Refresh inválido");
    }

    const data: { access: string, id?: string } = await refreshResponse.json();

    localStorage.setItem("access", data.access);
    const userId = data.id || getUserIdFromToken(data.access) || localStorage.getItem("id");

    if (userId) {
      localStorage.setItem("id", userId);
    }

    token = data.access;

    response = await makeRequest(token);
  }

  return response;
}