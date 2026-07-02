import { useEffect, useState } from "react";
import Menu from "../components/style/Menu";
import { authFetch } from "../services/auth";
import { API_HOST } from "../utils/static";

interface Email {
    id: number;
    email: string;
    criado_em: string;
}

export default function Emails() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [email, setEmail] = useState<string>("");

    const listaEmails = async () => {
        try {
            const res = await authFetch(`http://${API_HOST}:8000/api/acesso/lista-emails`);
            if (!res) return;

            const data = await res.json();
            setEmails(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        listaEmails();
    }, []);

    const handleDesativarEmail = async (id: number) => {
        try {
            const res = await authFetch(`http://${API_HOST}:8000/api/acesso/desativar-emails/${id}/`, {
                method: "PATCH",
            });
            if (!res) return;
            if (res.ok) {
                alert("Email excluido com sucesso");
                listaEmails();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCadastrarEmail = async () => {
        if (!email?.trim()) return;

        try {
            const res = await authFetch(`http://${API_HOST}:8000/api/acesso/cadastrar-email/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });
            if (!res) return;
            if (res.ok) {
                alert("Email cadastrado com sucesso");
                setEmail(""); 
                listaEmails();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="wrapper">
            <Menu />
            <div className="content-wrapper" style={{ minHeight: "100vh" }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h3>Emails cadastrados</h3>
                    </div>
                    <div className="card-body d-flex justify-content-center align-items-center">
                        <div className="input-group mr-2" style={{ width: "400px" }}>
                            <form className="form-inline" onSubmit={(e) => {e.preventDefault(); handleCadastrarEmail();}}>
                                <input type="email" className="form-control mr-2" placeholder="Digite o email..." value={email} onChange={(e) => setEmail(e.target.value)}/>
                                <button className="btn btn-primary" type="submit">Cadastrar Email</button>
                            </form>
                        </div>
                    </div>
                    <div className="card-body">
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Data de cadastro</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emails.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.email}</td>
                                        <td>
                                            {new Date(item.criado_em).toLocaleString("pt-BR")}
                                        </td>
                                        <td>
                                            <button className="btn btn-danger d-flex justify-content-center align-items-center"
                                            style={{width: "55px", height: "35px", padding: 0}} onClick={() => handleDesativarEmail(item.id)}>
                                                <i className="fas fa-trash m-0"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {emails.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center">
                                            Nenhum e-mail cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}