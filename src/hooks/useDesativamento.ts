import { desativarApontamento } from "../services/desativamento";
import Swal from "sweetalert2";

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

  const handleApontamentoMultiple = async (ids: number[]) => {
    if (ids.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sem dados",
        text: "Não há registros para deletar",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      icon: "warning",
      title: "Confirmar exclusão",
      text: `Você tem certeza que deseja deletar ${ids.length} registro(s)?`,
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, deletar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const promises = ids.map((id) => desativarApontamento(id));
      await Promise.all(promises);

      await Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: `${ids.length} registro(s) deletado(s) com sucesso!`,
      });

      window.location.reload();
    } catch (error) {
      console.log("Erro ao excluir apontamentos", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Ocorreu um erro ao deletar os registros",
      });
    }
  };

  return { handleApontamento, handleApontamentoMultiple };
};