import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showNewPendingOrderNotification,
  updateDocumentTitle,
  type NotificationPermissionState,
} from "../lib/orderNotifications";
import type { AppView, Order } from "../types";
import {
  getPendingOrders,
  getStalePendingOrders,
  sortOrdersByNewest,
} from "../utils/orderAlerts";

interface UseOrderAlertsOptions {
  orders: Order[];
  view: AppView;
  enabled: boolean;
}

export interface OrderAlertsState {
  pendingCount: number;
  staleCount: number;
  showBanner: boolean;
  highlightBadge: boolean;
  latestPendingCliente: string | null;
  notificationsSupported: boolean;
  notificationPermission: NotificationPermissionState;
  requestNotifications: () => Promise<NotificationPermissionState>;
}

export function useOrderAlerts({
  orders,
  view,
  enabled,
}: UseOrderAlertsOptions): OrderAlertsState {
  const [highlightBadge, setHighlightBadge] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(() => getNotificationPermission());

  const knownPendingIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const pendingOrders = useMemo(
    () => sortOrdersByNewest(getPendingOrders(orders)),
    [orders]
  );
  const pendingCount = pendingOrders.length;
  const staleCount = useMemo(
    () => getStalePendingOrders(orders).length,
    [orders]
  );
  const showBanner = enabled && pendingCount > 0 && view !== "pedidos";
  const latestPendingCliente = pendingOrders[0]?.clienteNome ?? null;

  useEffect(() => {
    if (!enabled) {
      updateDocumentTitle(0);
      return;
    }
    updateDocumentTitle(pendingCount);
    return () => updateDocumentTitle(0);
  }, [enabled, pendingCount]);

  useEffect(() => {
    if (!enabled) {
      initializedRef.current = false;
      knownPendingIdsRef.current = new Set();
      return;
    }

    const currentIds = new Set(pendingOrders.map((o) => o.id));

    if (!initializedRef.current) {
      knownPendingIdsRef.current = currentIds;
      initializedRef.current = true;
      return;
    }

    const newOrders = pendingOrders.filter(
      (o) => !knownPendingIdsRef.current.has(o.id)
    );

    if (newOrders.length > 0) {
      setHighlightBadge(true);
      const timer = window.setTimeout(() => setHighlightBadge(false), 8000);

      const newest = newOrders[0];
      if (notificationPermission === "granted") {
        showNewPendingOrderNotification({
          clienteNome: newest.clienteNome,
          totalPending: pendingCount,
        });
      }

      knownPendingIdsRef.current = currentIds;
      return () => window.clearTimeout(timer);
    }

    knownPendingIdsRef.current = currentIds;
  }, [enabled, pendingOrders, pendingCount, notificationPermission]);

  useEffect(() => {
    if (view === "pedidos") {
      setHighlightBadge(false);
    }
  }, [view]);

  const requestNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotificationPermission(result);
    return result;
  };

  return {
    pendingCount,
    staleCount,
    showBanner,
    highlightBadge,
    latestPendingCliente,
    notificationsSupported: typeof window !== "undefined" && "Notification" in window,
    notificationPermission,
    requestNotifications,
  };
}
