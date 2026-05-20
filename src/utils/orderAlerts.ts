import type { Order } from "../types";
import { isOrderPending } from "./orderStatus";

export const STALE_PENDING_HOURS = 24;

const MS_PER_HOUR = 60 * 60 * 1000;

export function getPendingOrders(orders: Order[]): Order[] {
  return orders.filter(isOrderPending);
}

export function sortOrdersByNewest(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()
  );
}

export function getStalePendingOrders(
  orders: Order[],
  staleHours = STALE_PENDING_HOURS
): Order[] {
  const threshold = Date.now() - staleHours * MS_PER_HOUR;
  return getPendingOrders(orders).filter((o) => o.criadoEm.getTime() < threshold);
}

export function formatPendingCountLabel(count: number): string {
  if (count === 1) return "1 pedido em aberto";
  return `${count} pedidos em aberto`;
}

export function formatStalePendingLabel(count: number): string {
  if (count === 1) {
    return "1 pedido aguardando há mais de 24 horas";
  }
  return `${count} pedidos aguardando há mais de 24 horas`;
}
