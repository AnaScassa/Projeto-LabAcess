import { authFetch } from "./auth";
import type { Users, UsuarioPrivilegiado } from "../types/Users";
import { API_HOST } from "../utils/static";

export async function buscarUsers(): Promise<Users[]> {
    const res = await authFetch(`http://${API_HOST}:8000/api/users/user/`);

    if (!res.ok) {
        throw new Error("Erro ao buscar usuários do users_service");
    }

    return res.json();
}

export async function buscarUsuariosPrivilegiados(): Promise<UsuarioPrivilegiado[]> {
    const response = await authFetch(`http://${API_HOST}:8000/api/users/admin-users/`);

    if (!response.ok) {
        throw new Error(`Erro ao buscar usuários privilegiados: HTTP ${response.status}`);
    }

    return response.json() as Promise<UsuarioPrivilegiado[]>;
}

export async function atualizarPermissaoSuperusuario(
    id: string | number,
    isSuperuser: boolean,
): Promise<UsuarioPrivilegiado> {
    const response = await authFetch(`http://${API_HOST}:8000/api/users/admin-users/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_superuser: isSuperuser }),
    });

    if (!response.ok) {
        const detail = await response.json().catch(() => null) as { detail?: string } | null;
        throw new Error(detail?.detail ?? `Erro ao atualizar permissão: HTTP ${response.status}`);
    }

    return response.json() as Promise<UsuarioPrivilegiado>;
}

export type DadosEdicaoUsuario = Pick<
    Users,
    "username" | "first_name" | "last_name" | "email" | "is_superuser"
>;

export async function atualizarUsuarioUsersService(
    id: string | number,
    dados: DadosEdicaoUsuario,
): Promise<Users> {
    const response = await authFetch(`http://${API_HOST}:8000/api/users/admin-users/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(dados),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => null) as {
            detail?: string;
            [field: string]: unknown;
        } | null;
        const validationMessage = body
            ? Object.entries(body)
                .map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(", ") : String(message)}`)
                .join(" ")
            : null;
        throw new Error(validationMessage || `Erro ao atualizar usuário: HTTP ${response.status}`);
    }

    return response.json() as Promise<Users>;
}

export async function carregarUsers(): Promise<Users[]> {
    try {
        return await buscarUsers();
    } catch (error) {
        console.error("Erro ao carregar users:", error);
        return [];
    }
}