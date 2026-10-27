import { useCallback, useEffect, useState } from "react";
import TableBody from "../style/TableBody";
import { registroEmails } from "../../services/email";
import { buscarUsers } from "../../services/users";
import type { Email } from "../../types/Email";
import type { Users } from "../../types/Users";

export default function EmailsAdmin() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [usuariosPorId, setUsuariosPorId] = useState<Map<string, Users>>(new Map());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarRegistros = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [resEmails, usuarios] = await Promise.all([
        registroEmails(),
        buscarUsers(),
      ]);

      if (!resEmails.ok) {
        throw new Error("Erro ao buscar registros de e-mail");
      }

      const registros: Email[] = await resEmails.json();
      setEmails(registros);
      setUsuariosPorId(new Map(usuarios.map((usuario) => [String(usuario.id), usuario] as const)));
    } catch (error) {
      console.error("Erro ao carregar registros de e-mail:", error);
      setErro("Não foi possível carregar os registros de e-mail e os usuários.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarRegistros();
  }, [carregarRegistros]);

  const nomeUsuario = (id: string | null) => {
    if (id === null || id.trim() === "") return "Sem registro";

    const usuario = usuariosPorId.get(String(id));
    if (!usuario) return `Usuário não encontrado (${id})`;

    const nomeCompleto = usuario.full_name?.trim() || `${usuario.first_name} ${usuario.last_name}`.trim();
    return nomeCompleto || usuario.username;
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="font-weight-bold text-dark mb-0">Registros de e-mails</h5>
      </div>

      {erro && <div className="alert alert-danger" role="alert">{erro}</div>}

      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">ID</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">E-mail</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Criado em</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Criado por</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Modificado em</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Modificado por</th>
              <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Ativo</th>
            </tr>
          </thead>
          <TableBody
            data={emails}
            colSpan={8}
            loading={carregando}
            emptyMessage={erro ? "Não foi possível carregar os registros." : "Nenhum registro de e-mail encontrado."}
            renderRow={(registro) => (
              <tr key={registro.id}>
                <td className="px-4 py-3 align-middle">{registro.id}</td>
                <td className="px-4 py-3 align-middle">{registro.email}</td>
                <td className="px-4 py-3 align-middle">{new Date(registro.criado_em).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 align-middle">{nomeUsuario(registro.criado_por)}</td>
                <td className="px-4 py-3 align-middle">{new Date(registro.modificado_em).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 align-middle">{nomeUsuario(registro.modificado_por)}</td>
                <td className="px-4 py-3 align-middle">{registro.ativado ? "Sim" : "Não"}</td>
              </tr>
            )}
          />
        </table>
      </div>
    </>
  );
}
