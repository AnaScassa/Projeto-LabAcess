import { USERS_API_BASE } from "../utils/static";

export const fazerLogin = async (username: string, password: string) => {
  return await fetch(`${USERS_API_BASE}/api/users/api/token/`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        username,
        password,
    }),
  });
};