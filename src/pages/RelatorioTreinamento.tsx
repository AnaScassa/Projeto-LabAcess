import { useUsuarios } from "../hooks/useUsuarios";
import { useTreinamento } from "../hooks/useTreinamento";
import CalculadorTreinamento from "../components/logicas/CalculadorTreinamento.tsx";
import BotaoVoltar from "../components/style/BotaoVoltar.tsx";

export default function RelatorioTreinamento() {

  const { usuarios } = useUsuarios();
  const { treinamentos } = useTreinamento();

  return (
    <div>
      <h1>Treinamentos expirados</h1>
      <BotaoVoltar/>
      <CalculadorTreinamento
        usuarios={usuarios}
        treinamentos={treinamentos}
      />
    </div>
  );
}