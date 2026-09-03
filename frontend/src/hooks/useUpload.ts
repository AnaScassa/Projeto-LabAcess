import { useEffect, useRef, useState, type FormEvent } from "react";
import { verificarId } from "../services/conferirid";
import { fazerUpload } from "../services/upload";
import { verificarProcessamento } from "../services/processamento";

type UseUploadResult = {
  mensagem: string;
  loading: boolean;
  estaBloqueado: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleUpload: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function useUpload(): UseUploadResult {
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [estaBloqueado, setEstaBloqueado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    verificarProcessamento(() => {
      setLoading(false);
      setEstaBloqueado(false);
      setMensagem("Processamento concluído!");
    });
  }, []);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const usuarioId = localStorage.getItem("id");

    if (!usuarioId) {
      window.location.replace("/login");
      return;
    }

    const token = localStorage.getItem("access");

    try {
      const response = await verificarId(usuarioId);

      if (response.status === 200) {
        setMensagem("Já existe um arquivo sendo processado.");
        return;
      }

      if (response.status !== 201) {
        setMensagem("Erro ao verificar processamento.");
        return;
      }
    } catch (error) {
      console.error("Erro ao verificar processamento:", error);
      setMensagem("Erro ao verificar processamento.");
      return;
    }

    if (!token) {
      setMensagem("Sessão expirada. Faça login novamente.");
      window.location.replace("/login");
      return;
    }

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setMensagem("Selecione um arquivo primeiro!");
      return;
    }

    setEstaBloqueado(true);
    setMensagem("Processando arquivo");

    try {
      const resposta = await fazerUpload(file);

      if (!resposta) {
        setMensagem("Erro no upload.");
        setEstaBloqueado(false);
        return;
      }

      setMensagem("Processamento sendo feito...");
      setLoading(true);
    } catch (error) {
      console.error("Erro no upload:", error);
      setMensagem("Erro no upload.");
      setEstaBloqueado(false);
    }
  };

  return { mensagem, loading, estaBloqueado, fileInputRef, handleUpload };
}
