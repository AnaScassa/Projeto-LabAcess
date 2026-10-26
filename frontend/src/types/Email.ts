
export interface Email {
    id: number;
    email: string;
    criado_em: string;
    criado_por: string | null;
    modificado_em: string;
    modificado_por: string | null;
    esta_ativo: boolean;
    ativado: boolean;
}
