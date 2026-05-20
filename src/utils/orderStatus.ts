import type { Order, OrderStatus } from "../types";

export type OrderSituation = "pendente" | "vendido" | "cancelado";

export function getOrderSituation(order: Order): OrderSituation {
  if (order.cancelado) return "cancelado";
  if (order.concluido) return "vendido";
  return "pendente";
}

export const ORDER_SITUATION_LABELS: Record<OrderSituation, string> = {
  pendente: "Pendente",
  vendido: "Vendido",
  cancelado: "Cancelado",
};

export function filterOrdersByStatus(orders: Order[], status: OrderStatus): Order[] {
  if (status === "todos") return orders;

  if (status === "cancelado") {
    return orders.filter((o) => o.cancelado);
  }

  if (status === "vendido") {
    return orders.filter((o) => o.concluido && !o.cancelado);
  }

  return orders.filter((o) => !o.concluido && !o.cancelado);
}

export function isOrderPending(order: Order): boolean {
  return !order.concluido && !order.cancelado;
}
