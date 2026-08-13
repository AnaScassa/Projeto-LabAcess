import { API_HOST } from "../utils/static";

export const fazerLogin = async (username: string, password: string) => {
  return await fetch(`http://${API_HOST}:8001/api/users/api/token/`, {
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