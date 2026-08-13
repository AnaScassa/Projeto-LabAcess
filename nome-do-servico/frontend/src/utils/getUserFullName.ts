import type { Users } from "../types/Users";

export function getUserFullName(user: Users) {
  if (user.full_name?.trim()) return user.full_name;

  const nomeCompleto = `${user.first_name} ${user.last_name}`.trim();
  return nomeCompleto || user.username;
}
