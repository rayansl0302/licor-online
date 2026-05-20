import { useState } from "react";
import { formatCurrency, formatDate } from "../utils/format";
import { copyOrderText, printOrder } from "../utils/orderText";
import {
  formatPendingCountLabel,
  formatStalePendingLabel,
  getPendingOrders,
  getStalePendingOrders,
} from "../utils/orderAlerts";
import {
  filterOrdersByStatus,
  getOrderSituation,
  ORDER_SITUATION_LABELS,
} from "../utils/orderStatus";
import type { Order, OrderStatus } from "../types";

interface OrdersPanelProps {
  orders: Order[];
  status: OrderStatus;
  loading: boolean;
  onStatusChange: (status: OrderStatus) => void;
  onToggleDone: (id: string, concluido: boolean) => void;
  onCancel: (id: string) => void;
  onReopen: (id: string) => void;
}

const FILTER_TABS: { value: OrderStatus; label: string; colorClass: string }[] = [
  { value: "pendente", label: "Pendentes", colorClass: "filter-tab--pendente" },
  { value: "vendido", label: "Vendidos", colorClass: "filter-tab--vendido" },
  { value: "cancelado", label: "Cancelados", colorClass: "filter-tab--cancelado" },
  { value: "todos", label: "Todos", colorClass: "" },
];

export function OrdersPanel({
  orders,
  status,
  loading,
  onStatusChange,
  onToggleDone,
  onCancel,
  onReopen,
}: OrdersPanelProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const filtered = filterOrdersByStatus(orders, status);
  const pendingOrders = getPendingOrders(orders);
  const pendingCount = pendingOrders.length;
  const staleCount = getStalePendingOrders(orders).length;

  const handleCopy = async (order: Order) => {
    const ok = await copyOrderText({
      clienteNome: order.clienteNome,
      marcaNome: order.marcaNome,
      itens: order.itens,
      total: order.total,
      observacao: order.observacao,
    });
    setFeedback(ok ? "Pedido copiado!" : "Não foi possível copiar.");
  };

  const handlePrint = (order: Order) => {
    printOrder({
      clienteNome: order.clienteNome,
      marcaNome: order.marcaNome,
      itens: order.itens,
      total: order.total,
      observacao: order.observacao,
    });
  };

  return (
    <section className="orders-panel" aria-label="Histórico de pedidos">
      <div className="orders-panel__header">
        <h2 className="panel-title">
          Histórico de pedidos
          {!loading && <span className="panel-title__count"> ({orders.length})</span>}
        </h2>

        <div className="status-legend" aria-label="Legenda de status">
          <span className="status-legend__item status-legend__item--pendente">
            Pendente
          </span>
          <span className="status-legend__item status-legend__item--vendido">
            Vendido
          </span>
          <span className="status-legend__item status-legend__item--cancelado">
            Cancelado
          </span>
        </div>

        <div className="filter-tabs" role="group" aria-label="Filtrar pedidos">
          {FILTER_TABS.map(({ value, label, colorClass }) => (
            <button
              key={value}
              type="button"
              className={`filter-tab ${colorClass} ${status === value ? "filter-tab--active" : ""}`}
              onClick={() => onStatusChange(value)}
            >
              {label}
              {value === "pendente" && pendingCount > 0 && (
                <span className="filter-tab__count">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {!loading && pendingCount > 0 && status !== "pendente" && (
        <p className="orders-panel__pending-hint" role="status">
          {formatPendingCountLabel(pendingCount)}.
          <button
            type="button"
            className="orders-panel__pending-link"
            onClick={() => onStatusChange("pendente")}
          >
            Ver pendentes
          </button>
        </p>
      )}

      {!loading && pendingCount > 0 && status === "pendente" && staleCount > 0 && (
        <p className="alert alert--warn orders-panel__stale-hint" role="status">
          {formatStalePendingLabel(staleCount)}
        </p>
      )}

      {feedback && (
        <p className="alert alert--success" role="status">
          {feedback}
        </p>
      )}

      {loading && <p className="empty-hint">Carregando pedidos…</p>}

      {!loading && filtered.length === 0 && (
        <p className="empty-hint">Nenhum pedido neste filtro.</p>
      )}

      <ul className="orders-list">
        {filtered.map((order) => {
          const situation = getOrderSituation(order);

          return (
            <li
              key={order.id}
              className={`order-card order-card--${situation}`}
            >
              <div className="order-card__header">
                <div>
                  <div className="order-card__title-row">
                    <strong className="order-card__client">
                      {order.clienteNome}
                    </strong>
                    <span
                      className={`order-badge order-badge--${situation}`}
                    >
                      {ORDER_SITUATION_LABELS[situation]}
                    </span>
                  </div>
                  <span className="order-card__meta">
                    {order.marcaNome} · {formatDate(order.criadoEm)}
                  </span>
                </div>
                <span className="order-card__total">
                  {formatCurrency(order.total)}
                </span>
              </div>

              <ul className="order-card__items">
                {order.itens.map((item) => (
                  <li key={item.productId}>
                    {item.quantidade}x {item.nome} —{" "}
                    {formatCurrency(item.preco * item.quantidade)}
                  </li>
                ))}
              </ul>

              {order.observacao && (
                <p className="order-card__note">Obs: {order.observacao}</p>
              )}

              <div className="order-card__actions">
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  onClick={() => handleCopy(order)}
                >
                  Copiar
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  onClick={() => handlePrint(order)}
                >
                  Imprimir
                </button>
                {situation === "pendente" && (
                  <>
                    <button
                      type="button"
                      className="btn btn--vendido btn--small"
                      onClick={() => onToggleDone(order.id, true)}
                    >
                      Marcar vendido
                    </button>
                    <button
                      type="button"
                      className="btn btn--cancelado btn--small"
                      onClick={() => onCancel(order.id)}
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {situation === "vendido" && (
                  <button
                    type="button"
                    className="btn btn--secondary btn--small"
                    onClick={() => onToggleDone(order.id, false)}
                  >
                    Voltar p/ pendente
                  </button>
                )}
                {situation === "cancelado" && (
                  <button
                    type="button"
                    className="btn btn--secondary btn--small"
                    onClick={() => onReopen(order.id)}
                  >
                    Reativar
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
