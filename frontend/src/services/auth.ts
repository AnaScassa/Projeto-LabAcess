import { API_HOST } from "../utils/static";

type TokenPayload = {
  id?: unknown;
  is_staff?: unknown;
  is_superuser?: unknown;
};

type TokenResponse = {
  access: string;
  id?: string | number;
  is_staff?: boolean | string;
  is_superuser?: boolean | string;
};

function getTokenPayload(token: string): TokenPayload | null {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) {
      return null;
    }

    const base64Payload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64Payload)) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

function getClaimValue(value: unknown): string | null {
  if (typeof value === "boolean" || typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return null;
}

export function getTokenUserData(token: string) {
  const payload = getTokenPayload(token);
  return {
    id: getClaimValue(payload?.id),
    is_staff: getClaimValue(payload?.is_staff),
    is_superuser: getClaimValue(payload?.is_superuser),
  };
}

export function storeUserPermissions(
  data: Pick<TokenResponse, "is_staff" | "is_superuser">,
  accessToken: string,
) {
  const tokenUserData = getTokenUserData(accessToken);
  const isStaff = getClaimValue(data.is_staff) ?? tokenUserData.is_staff;
  const isSuperuser = getClaimValue(data.is_superuser) ?? tokenUserData.is_superuser;

  if (isStaff !== null) {
    localStorage.setItem("is_staff", isStaff);
  } else {
    localStorage.removeItem("is_staff");
  }

  if (isSuperuser !== null) {
    localStorage.setItem("is_superuser", isSuperuser);
  } else {
    localStorage.removeItem("is_superuser");
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

    const data: TokenResponse = await refreshResponse.json();

    localStorage.setItem("access", data.access);
    const userId = data.id ? String(data.id) : getTokenUserData(data.access).id || localStorage.getItem("id");

    if (userId) {
      localStorage.setItem("id", userId);
    }
    storeUserPermissions(data, data.access);

    token = data.access;

    response = await makeRequest(token);
  }

  return response;
}