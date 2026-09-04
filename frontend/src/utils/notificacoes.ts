export async function solicitarPermissaoNotificacao() {

  if (!("Notification" in window)) {
    console.log("Navegador não suporta notificações");
    return;
  }

  console.log("Permissão atual:", Notification.permission);

  if (Notification.permission === "granted") {
    return;
  }

  if (Notification.permission === "denied") {
    console.log("Permissão bloqueada pelo usuário (precisa resetar no navegador)");
    return;
  }

  const permission = await Notification.requestPermission();

  console.log("Resultado da permissão:", permission);
}

export function exibirNotificacao(titulo: string, mensagem: string) {
  if (Notification.permission !== "granted") return;

  new Notification(titulo, {
    body: mensagem,
    icon: "/logo.png",
  });
}