const APP_TITLE = "Licor · Pedidos";

export type NotificationPermissionState =
  | NotificationPermission
  | "unsupported";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function updateDocumentTitle(pendingCount: number): void {
  document.title =
    pendingCount > 0 ? `(${pendingCount}) ${APP_TITLE}` : APP_TITLE;
}

export function showNewPendingOrderNotification(options: {
  clienteNome: string;
  totalPending: number;
}): void {
  if (!notificationsSupported()) return;
  if (Notification.permission !== "granted") return;

  const { clienteNome, totalPending } = options;
  const body =
    totalPending > 1
      ? `${clienteNome} · ${totalPending} pedidos em aberto no total`
      : `Cliente: ${clienteNome}`;

  const notification = new Notification("Novo pedido em aberto", {
    body,
    tag: "licor-pending-order",
    renotify: true,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
