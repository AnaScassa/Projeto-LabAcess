import { fetchEventSource } from "@microsoft/fetch-event-source";
import { SMARTCARD_API_BASE } from "../utils/static";

export const verificarProcessamento = async (onConcluido: () => void) => {
    const token = localStorage.getItem("access");

    if (!token) {
        return;
    }

    await fetchEventSource(`${SMARTCARD_API_BASE}/api/acesso/processamento/`, {
            method: "GET",

            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "text/event-stream",
            },

            onmessage(event) {
                const dados = JSON.parse(event.data);

                if (dados.status === "COMPLETED") {
                    console.log("Todas as tasks foram concluídas!");

                    onConcluido();
                }
            },

            onerror(error) {
                console.error("Erro no SSE:", error);
                throw error;
            },
        }
    );
};