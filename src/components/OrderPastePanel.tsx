import { useState } from "react";
import { useMarkup } from "../contexts/MarkupContext";
import { formatCurrency } from "../utils/format";
import { formatMarkupLabel } from "../utils/pricing";
import { parseOrderText, type ParseOrderResult } from "../utils/parseOrderText";

interface OrderPastePanelProps {
  onParse: (result: ParseOrderResult) => void;
}

const EXAMPLE = `Leila:
1 Caja Roque Pinto
1 amendoim Roque Pinto
1 coco cremoso Roque Pinto
1 chocolate cremoso Roque Pinto
1 jenipapo Roque Pinto
1 lá creme Roque Pinto`;

export function OrderPastePanel({ onParse }: OrderPastePanelProps) {
  const { markupPercent } = useMarkup();
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParseOrderResult | null>(null);

  const handleInterpret = () => {
    setPreview(parseOrderText(text, markupPercent));
  };

  const handleApply = () => {
    if (!preview || preview.itens.length === 0) return;
    onParse(preview);
    setPreview(null);
  };

  return (
    <section className="paste-panel" aria-label="Colar pedido">
      <div className="paste-panel__head">
        <h2 className="panel-title">Colar pedido</h2>
        <span className="markup-badge">
          {formatMarkupLabel(markupPercent)} nos valores
        </span>
      </div>
      <p className="paste-panel__hint">
        Cole o texto do WhatsApp. Primeira linha com nome e dois pontos (ex:{" "}
        <strong>Leila:</strong>). Depois, uma linha por item.
      </p>

      <label className="field">
        <span className="sr-only">Texto do pedido</span>
        <textarea
          className="field__textarea"
          rows={7}
          placeholder={EXAMPLE}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPreview(null);
          }}
        />
      </label>

      <div className="paste-panel__actions">
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={() => setText(EXAMPLE)}
        >
          Exemplo
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!text.trim()}
          onClick={handleInterpret}
        >
          Interpretar
        </button>
      </div>

      {preview && (
        <div className="paste-preview">
          {preview.clienteNome && (
            <p className="paste-preview__client">
              Cliente: <strong>{preview.clienteNome}</strong>
            </p>
          )}

          {preview.itens.length > 0 && (
            <ul className="paste-preview__list">
              {preview.itens.map((item) => (
                <li key={item.productId}>
                  {item.quantidade}x {item.nome} —{" "}
                  {formatCurrency(item.preco * item.quantidade)}
                </li>
              ))}
            </ul>
          )}

          {preview.itens.length > 0 && (
            <p className="paste-preview__total">
              Total: <strong>{formatCurrency(preview.total)}</strong>
            </p>
          )}

          {preview.avisos.map((msg) => (
            <p key={msg} className="paste-preview__warn">
              {msg}
            </p>
          ))}

          {preview.erros.map((msg) => (
            <p key={msg} className="paste-preview__error">
              {msg}
            </p>
          ))}

          <button
            type="button"
            className="btn btn--primary"
            disabled={preview.itens.length === 0}
            onClick={handleApply}
          >
            Usar no pedido
          </button>
        </div>
      )}
    </section>
  );
}
