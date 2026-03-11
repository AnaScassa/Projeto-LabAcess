export type Usuario = {
  matricula: string;
  nome_usuario: string;
  acessos?: {
    desc_area: string;
    data_acesso: string;
    ent_sai: string;
  }[];
};