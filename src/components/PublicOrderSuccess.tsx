import { useState } from "react";
import { formatCurrency } from "../utils/format";
import type { CartItem } from "../types";
import {
  copyWhatsAppConfirmMessage,
  formatWhatsAppConfirmMessage,
  type OrderTextInput,
} from "../utils/orderText";
import "./PublicOrderSuccess.css";

interface PublicOrderSuccessProps {
  order: OrderTextInput;
  onNewOrder: () => void;
}

export function PublicOrderSuccess({ order, onNewOrder }: PublicOrderSuccessProps) {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopyWhatsApp = async () => {
    const ok = await copyWhatsAppConfirmMessage(order);
    setCopyFeedback(
      ok
        ? "Copiado! Abra o WhatsApp e cole a mensagem."
        : "Não foi possível copiar."
    );
    window.setTimeout(() => setCopyFeedback(null), 3500);
  };

  return (
    <main className="public-order-success">
      <header className="public-order-success__header">
        <h1 className="public-order-success__title">Pedido enviado!</h1>
        <p className="public-order-success__subtitle">
          Confira o resumo abaixo. Copie a mensagem e cole no WhatsApp para
          confirmar.
        </p>
      </header>

      <section className="public-order-success__card" aria-label="Resumo do pedido">
        <div className="public-order-success__client">
          <span className="public-order-success__label">Cliente</span>
          <strong>{order.clienteNome}</strong>
        </div>

        {order.marcaNome && (
          <p className="public-order-success__brand">{order.marcaNome}</p>
        )}

        <ul className="public-order-success__items">
          {order.itens.map((item: CartItem) => (
            <li key={item.productId} className="public-order-success__item">
              <span>
                {item.quantidade}x {item.nome}
              </span>
              <span>{formatCurrency(item.preco * item.quantidade)}</span>
            </li>
          ))}
        </ul>

        <div className="public-order-success__total">
          <span>Total</span>
          <strong>{formatCurrency(order.total)}</strong>
        </div>

        {order.observacao?.trim() && (
          <p className="public-order-success__obs">
            <span className="public-order-success__label">Observação</span>
            {order.observacao.trim()}
          </p>
        )}

        <pre className="public-order-success__text" aria-label="Texto do pedido">
          {formatWhatsAppConfirmMessage(order)}
        </pre>
      </section>

      {copyFeedback && (
        <p className="alert alert--success public-order-success__feedback" role="status">
          {copyFeedback}
        </p>
      )}

      <div className="public-order-success__actions">
        <button
          type="button"
          className="btn btn--primary public-order-success__whatsapp"
          onClick={handleCopyWhatsApp}
        >
          Copiar e colar no WhatsApp
        </button>

        <button type="button" className="btn btn--secondary" onClick={onNewOrder}>
          Fazer outro pedido
        </button>
      </div>
    </main>
  );
}
