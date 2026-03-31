export type Usuario = {
  matricula: string;
  nome_usuario: string;
  user_auth_id: string;
  acessos?: {
    id: number; 
    desc_area: string;
    data_acesso: string;
    ent_sai: string;
    apontamento?: number; 
  }[];
};