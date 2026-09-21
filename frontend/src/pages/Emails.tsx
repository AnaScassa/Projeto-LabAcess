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

            <div className="content-wrapper" style={{minHeight: "100vh"}}>
                <div className="icon-dashboard d-flex align-items-center px-4 pt-3 pb-0">
                    <i className="fas fa-envelope text-primary me-2" style={{fontSize: "35px"}}></i>
                    <h2 className="mb-0 fw-semibold text-dark">Emails cadastrados</h2>
                </div>
                <small className="text-secondary px-4 pt-0 pb-2">Gerencie os emails autorizados a receber notificações</small>

                <section className="content px-4 pt-3">
                    <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">
                        <div className="card-header bg-white border-bottom px-4 py-3">
                            <div className="d-flex flex-row align-items-center">
                                <i className="fas fa-plus-circle text-primary me-2"></i>
                                <h5 className="mb-0 fw-semibold text-dark">Cadastrar novo email</h5>
                            </div>
                            <div>
                                <small className="text-secondary">Adicione um email à lista de destinatários</small>
                            </div>
                        </div>

                        <div className="card-body px-4 py-4">
                            <form className="d-flex align-items-center gap-2" onSubmit={(e) => {
                                e.preventDefault();
                                handleCadastrarEmail();
                            }}>
                                    <input type="email" className="form-control" placeholder="Digite o email..." value={email} onChange={(e) => setEmail(e.target.value)}/>
                                <div className="d-flex pl-2">
                                    <button className="btn btn-primary d-flex align-items-center" type="submit" style={{width: "160px", maxHeight: "38px"}}>
                                        <i className="fas fa-plus me-2"></i>
                                        Cadastrar Email
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                <section className="content px-4 pt-4 pb-4">
                    <div className="card border-0 border-top border-primary rounded-3 shadow-sm overflow-hidden m-0">
                        <div className="card-header bg-white border-bottom px-4 py-3">
                            <div className="d-flex flex-row align-items-center">
                                <i className="fas fa-list text-primary me-2"></i>
                                <h5 className="mb-0 fw-semibold text-dark">Emails ativos</h5>
                            </div>
                            <div>
                                <small className="text-secondary">Lista de emails cadastrados no sistema</small>
                            </div>
                        </div>

                        <div className="card-body p-0 overflow-auto">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Email</th>
                                            <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Data de cadastro</th>
                                            <th className="px-4 py-3 text-secondary small text-uppercase fw-semibold">Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {emails.filter((item) => item.ativado).map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 align-middle">{item.email}</td>

                                                <td className="px-4 py-3 align-middle">
                                                    {new Date(item.criado_em).toLocaleString("pt-BR")}
                                                </td>

                                                <td className="px-4 py-3 align-middle">
                                                    <button className="btn btn-outline-danger d-flex justify-content-center align-items-center"
                                                        style={{width: "40px", height: "35px", padding: 0}}
                                                        onClick={() => handleDesativarEmail(item.id)}>
                                                        <i className="fas fa-trash m-0"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {emails.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="text-center py-4 text-secondary">
                                                    Nenhum e-mail cadastrado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {emails.filter((item) => !item.ativado).length > 0 && (
                    <section className="content px-4 pb-4">
                        <div className="card border-0 border-top border-warning rounded-3 shadow-sm overflow-hidden m-0">
                            <div className="card-header bg-white border-bottom px-4 py-3">
                                <div className="d-flex flex-row align-items-center">
                                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                    <h5 className="mb-0 fw-semibold text-dark">Emails pendentes</h5>
                                </div>
                                <div>
                                    <small className="text-secondary">Emails identificados no sistema que ainda não foram cadastrados</small>
                                </div>
                            </div>

                            <div className="card-body px-4 py-3">
                                <div className="alert alert-warning mb-3">
                                    <strong>Foram identificados e-mails logando no sistema. Deseja adicioná-los à lista?</strong>
                                </div>

                                {emails.filter((item) => !item.ativado).map((item) => (
                                    <div key={item.id} className="d-flex justify-content-between align-items-center border p-3 mb-2 rounded">
                                        <span>
                                            <strong>{item.email}</strong>
                                        </span>

                                        <div className="d-flex">
                                            <button className="btn btn-outline-success d-flex justify-content-center align-items-center mr-1"
                                                style={{width: "40px", height: "35px", padding: 0}}
                                                onClick={() => {handleAtivarEmail(item.email)}}>
                                                <i className="fas fa-check m-0"></i>
                                            </button>

                                            <button className="btn btn-outline-danger d-flex justify-content-center align-items-center"
                                                style={{width: "40px", height: "35px", padding: 0}}
                                                onClick={() => handleDesativarEmail(item.id)}>
                                                <i className="fas fa-times m-0"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}