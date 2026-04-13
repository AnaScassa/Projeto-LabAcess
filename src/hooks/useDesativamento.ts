import { desativarApontamento } from "../services/desativamento";

export const useApontamentoActions = () => {

  const handleApontamento = async (id: number) => {
    try {
      await desativarApontamento(id);
      alert("Registro apagado!");
      window.location.reload();
    } catch (error) {
      console.log("Erro ao excluir apontamento", error);
    }
  };

  return { handleApontamento };
};