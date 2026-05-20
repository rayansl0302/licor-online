import { useMemo } from "react";
import { formatCurrency } from "../utils/format";
import { computeSalesStats } from "../utils/salesStats";
import type { Order } from "../types";

interface ResumoPageProps {
  orders: Order[];
  loading: boolean;
}

export function ResumoPage({ orders, loading }: ResumoPageProps) {
  const stats = useMemo(() => computeSalesStats(orders), [orders]);

  if (loading) {
    return <p className="empty-hint">Carregando resumo…</p>;
  }

  return (
    <div className="resumo-page">
      <header className="page-header">
        <h2 className="page-header__title">Resumo de vendas</h2>
        <p className="page-header__subtitle">
          Controle de quanto vendeu, pedidos e clientes.
        </p>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-card__label">Total vendido</span>
          <strong className="stat-card__value">
            {formatCurrency(stats.totalVendido)}
          </strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Pedidos</span>
          <strong className="stat-card__value">{stats.totalPedidos}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Concluídos</span>
          <strong className="stat-card__value stat-card__value--success">
            {stats.pedidosConcluidos}
          </strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Pendentes</span>
          <strong className="stat-card__value stat-card__value--warn">
            {stats.pedidosPendentes}
          </strong>
        </article>
        <article className="stat-card stat-card--wide">
          <span className="stat-card__label">Ticket médio</span>
          <strong className="stat-card__value">
            {formatCurrency(stats.ticketMedio)}
          </strong>
        </article>
      </div>

      <section className="clients-section">
        <h3 className="section-title">Clientes</h3>
        {stats.clientes.length === 0 ? (
          <p className="empty-hint">Nenhum pedido registrado ainda.</p>
        ) : (
          <div className="clients-table-wrap">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Pedidos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.clientes.map((client) => (
                  <tr key={client.nome.toLowerCase()}>
                    <td>{client.nome}</td>
                    <td>{client.pedidos}</td>
                    <td>{formatCurrency(client.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
