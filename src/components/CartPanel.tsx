import { formatCurrency } from "../utils/format";
import type { CartItem } from "../types";

interface CartPanelProps {
  clienteNome: string;
  observacao: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  saving: boolean;
  onClienteChange: (value: string) => void;
  onObservacaoChange: (value: string) => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onSave: () => void;
  onCopy: () => void;
  onPrint: () => void;
  saveLabel?: string;
  showClear?: boolean;
  showCopyPrint?: boolean;
  showCopy?: boolean;
  showPrint?: boolean;
  copyLabel?: string;
  clienteLabel?: string;
  emptyHint?: string;
  onCancel?: () => void;
}

export function CartPanel({
  clienteNome,
  observacao,
  items,
  total,
  itemCount,
  saving,
  onClienteChange,
  onObservacaoChange,
  onQuantityChange,
  onRemove,
  onClear,
  onSave,
  onCopy,
  onPrint,
  saveLabel = "Salvar pedido",
  showClear = true,
  showCopyPrint = true,
  showCopy: showCopyProp,
  showPrint: showPrintProp,
  copyLabel = "Copiar",
  clienteLabel = "Nome do cliente *",
  emptyHint = "Cole o pedido acima ou toque em + na lista de sabores.",
  onCancel,
}: CartPanelProps) {
  const showCopy = showCopyProp ?? showCopyPrint;
  const showPrint = showPrintProp ?? showCopyPrint;
  const canSave = clienteNome.trim().length > 0 && items.length > 0 && !saving;
  const canCopy = clienteNome.trim().length > 0 && items.length > 0;

  return (
    <aside className="cart-panel" aria-label="Pedido atual">
      <div className="cart-panel__head">
        <h2 className="panel-title">Resumo do pedido</h2>
        {itemCount > 0 && (
          <span className="cart-panel__count">{itemCount} un.</span>
        )}
      </div>

      <label className="field">
        <span className="field__label">{clienteLabel}</span>
        <input
          type="text"
          className="field__input"
          placeholder="Ex: Maria Silva"
          value={clienteNome}
          onChange={(e) => onClienteChange(e.target.value)}
          autoComplete="name"
        />
      </label>

      <label className="field">
        <span className="field__label">Observação</span>
        <input
          type="text"
          className="field__input"
          placeholder="Entrega, troco, etc."
          value={observacao}
          onChange={(e) => onObservacaoChange(e.target.value)}
        />
      </label>

      {items.length === 0 ? (
        <p className="empty-hint">{emptyHint}</p>
      ) : (
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.productId} className="cart-item">
              <div className="cart-item__top">
                <span className="cart-item__name">{item.nome}</span>
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  aria-label={`Remover ${item.nome}`}
                  onClick={() => onRemove(item.productId)}
                >
                  ✕
                </button>
              </div>
              <div className="cart-item__bottom">
                <div className="qty-control">
                  <button
                    type="button"
                    className="btn btn--qty"
                    aria-label="Diminuir quantidade"
                    onClick={() => onQuantityChange(item.productId, -1)}
                  >
                    −
                  </button>
                  <span className="qty-control__value">{item.quantidade}</span>
                  <button
                    type="button"
                    className="btn btn--qty"
                    aria-label="Aumentar quantidade"
                    onClick={() => onQuantityChange(item.productId, 1)}
                  >
                    +
                  </button>
                </div>
                <span className="cart-item__subtotal">
                  {formatCurrency(item.preco * item.quantidade)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="cart-footer">
        <div className="cart-total">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        {(showCopy || showPrint) && (
          <div className="cart-actions cart-actions--row">
            {showCopy && (
              <button
                type="button"
                className="btn btn--secondary btn--small"
                disabled={!canCopy}
                onClick={onCopy}
              >
                {copyLabel}
              </button>
            )}
            {showPrint && (
              <button
                type="button"
                className="btn btn--secondary btn--small"
                disabled={items.length === 0}
                onClick={onPrint}
              >
                Imprimir
              </button>
            )}
          </div>
        )}
        <div className="cart-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn--secondary"
              disabled={saving}
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}
          {showClear && (
            <button
              type="button"
              className="btn btn--secondary"
              disabled={items.length === 0 || saving}
              onClick={onClear}
            >
              Limpar
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary"
            disabled={!canSave}
            onClick={onSave}
          >
            {saving ? "Salvando…" : saveLabel}
          </button>
        </div>
      </div>
    </aside>
  );
}
