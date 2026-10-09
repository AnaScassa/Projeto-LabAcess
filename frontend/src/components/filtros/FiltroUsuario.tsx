interface FiltroUsuarioProps {
  id?: string;
  usuarios: { matricula: string; nome_usuario: string }[];
  usuarioSelecionado: string;
  onChange: (matricula: string) => void;
}

export default function FiltroUsuario({
  id,
  usuarios,
  usuarioSelecionado,
  onChange,
}: FiltroUsuarioProps) {
  const usuariosOrdenados = [...usuarios].sort((a, b) =>
    a.nome_usuario.localeCompare(b.nome_usuario)
  );

  return (
    <select     id={id}
    className="form-control" value={usuarioSelecionado} onChange={(event) => onChange(event.target.value)}>
      <option value="">-- Selecione --</option>
      {usuariosOrdenados.map((usuario) => (
        <option key={usuario.matricula} value={usuario.matricula}>{usuario.nome_usuario}</option>
      ))}
    </select>
  );
}
