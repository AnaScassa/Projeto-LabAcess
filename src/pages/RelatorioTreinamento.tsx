import { useUsers } from "../hooks/useUsers";
import { useTreinamento } from "../hooks/useTreinamento";
import { useUsuarios } from "../hooks/useUsuarios"; 
import CalculadorTreinamento from "../components/logicas/CalculadorTreinamento.tsx";
import BotaoVoltar from "../components/style/BotaoVoltar.tsx";

export default function RelatorioTreinamento() {

  const { users } = useUsers();            
  const { treinamentos } = useTreinamento(); 
  const { usuarios } = useUsuarios();       

  return (
    <div>
      <h1>Treinamentos expirados</h1>
      <BotaoVoltar/>
      <CalculadorTreinamento
        users={users}
        usuarios={usuarios}   
        treinamentos={treinamentos}
      />
    </div>
  );
}