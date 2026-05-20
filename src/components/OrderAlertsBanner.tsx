import { useState } from "react";
import {
  formatPendingCountLabel,
  formatStalePendingLabel,
} from "../utils/orderAlerts";
import type { NotificationPermissionState } from "../lib/orderNotifications";
import "./OrderAlertsBanner.css";

interface OrderAlertsBannerProps {
  pendingCount: number;
  staleCount: number;
  latestPendingCliente: string | null;
  notificationsSupported: boolean;
  notificationPermission: NotificationPermissionState;
  onViewPedidos: () => void;
  onRequestNotifications: () => Promise<NotificationPermissionState>;
}

export function OrderAlertsBanner({
  pendingCount,
  staleCount,
  latestPendingCliente,
  notificationsSupported,
  notificationPermission,
  onViewPedidos,
  onRequestNotifications,
}: OrderAlertsBannerProps) {
  const [notifyFeedback, setNotifyFeedback] = useState<string | null>(null);

  if (pendingCount === 0) return null;

  const showNotifyButton =
    notificationsSupported && notificationPermission !== "granted";

  const handleEnableNotifications = async () => {
    const result = await onRequestNotifications();
    if (result === "granted") {
      setNotifyFeedback("Avisos do navegador ativados.");
      return;
    }
    if (result === "denied") {
      setNotifyFeedback("Permissão negada no navegador.");
      return;
    }
    if (result === "unsupported") {
      setNotifyFeedback("Este navegador não suporta avisos.");
    }
  };

  return (
    <aside
      className="order-alerts-banner"
      role="status"
      aria-live="polite"
      aria-label="Aviso de pedidos em aberto"
    >
      <div className="order-alerts-banner__content">
        <p className="order-alerts-banner__title">
          {formatPendingCountLabel(pendingCount)}
        </p>
        {latestPendingCliente && (
          <p className="order-alerts-banner__detail">
            Mais recente: <strong>{latestPendingCliente}</strong>
          </p>
        )}
        {staleCount > 0 && (
          <p className="order-alerts-banner__stale">
            {formatStalePendingLabel(staleCount)}
          </p>
        )}
        {notifyFeedback && (
          <p className="order-alerts-banner__feedback">{notifyFeedback}</p>
        )}
      </div>

      <div className="order-alerts-banner__actions">
        <button
          type="button"
          className="btn btn--primary btn--small"
          onClick={onViewPedidos}
        >
          Ver pendentes
        </button>
        {showNotifyButton && (
          <button
            type="button"
            className="btn btn--secondary btn--small"
            onClick={handleEnableNotifications}
          >
            Ativar avisos
          </button>
        )}
      </div>
    </aside>
  );
}
