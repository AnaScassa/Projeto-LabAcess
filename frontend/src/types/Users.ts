export type Users = {
  id: string | number;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email?: string;
  is_superuser: boolean;
};

export type UsuarioPrivilegiado = Pick<
  Users,
  "id" | "username" | "first_name" | "last_name" | "email"
> & {
  is_staff: boolean;
  is_superuser: boolean;
};