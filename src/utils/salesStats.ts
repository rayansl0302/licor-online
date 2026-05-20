import type { Order } from "../types";

export interface ClientSummary {
  nome: string;
  pedidos: number;
  total: number;
}

export interface SalesStats {
  totalVendido: number;
  totalPedidos: number;
  pedidosConcluidos: number;
  pedidosPendentes: number;
  ticketMedio: number;
  clientes: ClientSummary[];
}

export function computeSalesStats(orders: Order[]): SalesStats {
  const vendidos = orders.filter((o) => o.concluido && !o.cancelado);
  const totalVendido = vendidos.reduce((sum, o) => sum + o.total, 0);
  const pedidosConcluidos = vendidos.length;
  const pedidosPendentes = orders.filter((o) => !o.concluido && !o.cancelado).length;

  const clientMap = new Map<string, ClientSummary>();

  for (const order of vendidos) {
    const nome = order.clienteNome.trim();
    const key = nome.toLowerCase();
    const current = clientMap.get(key) ?? { nome, pedidos: 0, total: 0 };
    current.pedidos += 1;
    current.total += order.total;
    clientMap.set(key, current);
  }

  const clientes = Array.from(clientMap.values()).sort((a, b) => b.total - a.total);

  return {
    totalVendido,
    totalPedidos: orders.length,
    pedidosConcluidos,
    pedidosPendentes,
    ticketMedio: vendidos.length > 0 ? totalVendido / vendidos.length : 0,
    clientes,
  };
}
