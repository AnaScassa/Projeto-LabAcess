import { useEffect, useState } from "react";
import Menu from "../components/style/Menu";
import {listaEmails, cadastrarEmail, desativarEmail} from "../services/email";
import type { Email } from "../types/Email";

export default function Emails() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [email, setEmail] = useState("");

    const carregarEmails = async () => {
        try {
            const res = await listaEmails();
            if (!res) return;

            const data = await res.json();
            setEmails(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        carregarEmails();
    }, []);

    const handleCadastrarEmail = async () => {
        if (!email.trim()) return;

        try {
            const res = await cadastrarEmail(email);
            if (!res) return;

            if (res.ok) {
                alert("Email cadastrado com sucesso");
                setEmail("");
                carregarEmails();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAtivarEmail = async (emailParam: string) => {
        if (!emailParam.trim()) return;

        try {
            const res = await cadastrarEmail(emailParam);
            if (!res) return;

            if (res.ok) {
                alert("Email cadastrado com sucesso");
                setEmail("");
                carregarEmails();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDesativarEmail = async (id: number) => {
        try {
            const res = await desativarEmail(id);
            if (!res) return;

            if (res.ok) {
                alert("Email excluído com sucesso");
                carregarEmails();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="wrapper">
            <Menu />
            <div className="content-wrapper" style={{ minHeight: "100vh" }}>
                <div className="content p-4">
                    <div className="card">
                        <div className="card-header text-center">
                            <h3>Emails cadastrados</h3>
                        </div>
                        <div className="card-body d-flex justify-content-center align-items-center">
                            <div className="input-group mr-2 align-items-center justify-content-center" style={{ width: "400px" }}>
                                <form className="d-flex align-items-center justify-content-center gap-2 flex-wrap" onSubmit={(e) => {e.preventDefault(); handleCadastrarEmail();}}>
                                    <input type="email" className="form-control mb-2" placeholder="Digite o email..." value={email} onChange={(e) => setEmail(e.target.value)}/>
                                    <button className="btn btn-primary" type="submit">Cadastrar Email</button>
                                </form>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Data de cadastro</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {emails.filter((item) => item.ativado).map((item) => (
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
                    {emails .filter((item) => !item.ativado).length > 0 && (
                    <div className="alert alert-warning mb-3">
                        <strong>Foram identificados e-mails logando no sistema. Deseja adicioná-los à lista?</strong>

                        <div className="mt-3">
                            {emails.filter((item) => !item.ativado).map((item) => (
                                <div key={item.id} className="d-flex justify-content-between align-items-center border p-2 mb-2 rounded" style={{ border: "1px solid #000" }}>
                                    <span><strong>{item.email}</strong></span>
                                    <div className="d-flex gap-4">
                                        <div className="d-flex justify-content-center align-items-center" style={{ width: "100px", gap: "10px" }}>
                                            <button className="btn btn-success btn-sm" 
                                            style={{ width: "35px", height: "35px", padding: 0, display: "inline-flex", justifyContent: "center", alignItems: "center" }}
                                            onClick={() => {handleAtivarEmail(item.email)}}>
                                                <i className="fas fa-check m-0"></i>
                                            </button>
                                            <button className="btn btn-danger btn-sm" 
                                            style={{ width: "35px", height: "35px", padding: 0, display: "inline-flex", justifyContent: "center", alignItems: "center" }}
                                            onClick={() => handleDesativarEmail(item.id)}>
                                                <i className="fas fa-times m-0"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}