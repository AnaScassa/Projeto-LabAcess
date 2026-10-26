export type Usuario = {
  id: number;
  url: string;
  matricula: string;
  nome_usuario: string;
  user_auth_id: number | string | null;
  categoriaUsuario: string | null;
  username_mrbs: string | null;
  acessos: {
    id: number; 
    data_acesso: string | null;
    desc_area: string;
    ent_sai: string;
    eh_agendado: boolean;
    apontamento?: number; 
  }[];
};