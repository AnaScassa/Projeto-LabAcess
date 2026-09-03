import { useEffect, useState } from "react";
import { buscarUltimaResposta } from "../services/buscarResposta";
import { receberRespostas, type RespostaRpa } from "../services/receberResposta";

type StatusRpaState = {
  statusBusca: string | null;
  mensagem: string;
  quantidadeUltimaBusca: number | null;
  dataUltimaBusca: string | null;
};

function converterResposta(dados: RespostaRpa): Partial<StatusRpaState> {
  if (!dados.status) {
    return {
      statusBusca: null,
      mensagem: "Aguardando resposta do RPA...",
    };
  }

  const statusBusca = dados.status.toLowerCase();

  if (statusBusca === "finalizado") {
    return {
      statusBusca,
      mensagem: `Busca finalizada. Quantidade: ${dados.quantidade ?? 0}`,
      quantidadeUltimaBusca: dados.quantidade ?? 0,
      dataUltimaBusca: dados.criado_em ?? null,
    };
  }

  if (statusBusca === "erro") {
    return {
      statusBusca,
      mensagem: `Busca com erro: ${dados.status}`,
    };
  }

  return {
    statusBusca,
    mensagem: statusBusca === "pending" ? "Aguardando resposta do RPA..." : `Status do RPA: ${dados.status}`,
  };
}

const estadoInicial: StatusRpaState = {
  statusBusca: null,
  mensagem: "",
  quantidadeUltimaBusca: null,
  dataUltimaBusca: null,
};

export function useRpaStatus() {
  const [estado, setEstado] = useState<StatusRpaState>(estadoInicial);

  useEffect(() => {
    let ativo = true;

    const processarResposta = (dados: RespostaRpa) => {
      if (!ativo) {
        return;
      }

      if (!document.hidden) {
        console.log("Resposta recebida do RPA:", dados);
      }

      setEstado((estadoAtual) => ({
        ...estadoAtual,
        ...converterResposta(dados),
      }));
    };

    buscarUltimaResposta()
      .then((dados) => {
        if (!document.hidden) {
          console.log("Última resposta do RPA:", dados);
        }
        processarResposta(dados);
      })
      .catch((erro) => {
        if (!document.hidden) {
          console.error("Erro ao buscar último status:", erro);
        }
        if (ativo) {
          setEstado((estadoAtual) => ({ ...estadoAtual, statusBusca: null }));
        }
      });

    const parar = receberRespostas(processarResposta, () => {
      if (ativo) {
        setEstado((estadoAtual) => ({ ...estadoAtual, statusBusca: null }));
      }
    });

    return () => {
      ativo = false;
      parar();
    };
  }, []);

  const iniciarBusca = () => {
    setEstado((estadoAtual) => ({
      ...estadoAtual,
      statusBusca: "pending",
      mensagem: "Enviando busca ao RPA...",
    }));
  };

  return { ...estado, iniciarBusca };
}
