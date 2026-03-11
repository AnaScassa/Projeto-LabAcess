import { useEffect, useState } from "react";
import FiltroRecente from "../components/FiltroRecente";
import { authFetch } from "../services/auth";

type Usuario ={
    matricula: string;
    nome_usuario: string;
    acessos?: {
    desc_area: string;
    data_acesso: string;
    ent_sai: string;
  }[];
}

export default function RelatorioRecente(){
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    useEffect(() => {
    
        async function carregarUsuarios() {
          try {
    
            const res = await authFetch(
              "http://localhost:8000/api/acesso/usuarios/"
            );
    
            if (!res) return;
    
            if (!res.ok) {
              throw new Error("Não autorizado");
            }
    
            const data = await res.json();
            setUsuarios(data);
    
          } catch (error) {
            console.error("Erro ao carregar usuários:", error);
          }
        }
    
        carregarUsuarios();
    
      }, []);

        return (
          <div>
      
            <h1>Relatório do último mês lab</h1>
      
            <a href="/upload">
              <button style={{ margin: "0 20px 20px 0" }}>
                Voltar
              </button>
            </a>
      
            <FiltroRecente
              usuarios={usuarios}
            />
      
          </div>
        );
}