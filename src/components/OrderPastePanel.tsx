import { useState } from "react";
import { useMarkup } from "../contexts/MarkupContext";
import { formatCurrency } from "../utils/format";
import { formatMarkupLabel } from "../utils/pricing";
import { parseOrderText, type ParseOrderResult } from "../utils/parseOrderText";

interface OrderPastePanelProps {
  onParse: (result: ParseOrderResult) => void;
}

const EXAMPLE = `Leila Maria:
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
  const [previewCliente, setPreviewCliente] = useState("");

  const handleInterpret = () => {
    const result = parseOrderText(text, markupPercent);
    setPreview(result);
    setPreviewCliente(result.clienteNome);
  };

  const handleSave = () => {
    if (!preview || preview.itens.length === 0) return;

    onParse({
      ...preview,
      clienteNome: previewCliente.trim(),
    });
    setPreview(null);
    setPreviewCliente("");
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
        Cole o texto do WhatsApp. Primeira linha: nome completo com dois pontos
        (ex: <strong>Leila Maria:</strong>). Depois, uma linha por item. Toque
        em Interpretar e confira antes de Salvar.
      </p>

      <label className="field">
        <span className="sr-only">Texto do pedido</span>
        <textarea
          className="field__textarea"
          rows={6}
          placeholder={EXAMPLE}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPreview(null);
            setPreviewCliente("");
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
          className="btn btn--secondary"
          disabled={!text.trim()}
          onClick={handleInterpret}
        >
          Interpretar
        </button>
      </div>

      {preview && (
        <div className="paste-preview">
          <label className="field paste-preview__client-field">
            <span className="field__label">Nome do cliente</span>
            <input
              type="text"
              className="field__input"
              value={previewCliente}
              onChange={(e) => setPreviewCliente(e.target.value)}
              placeholder="Nome completo"
              autoComplete="name"
            />
          </label>

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

          <div className="paste-preview__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setPreview(null);
                setPreviewCliente("");
              }}
            >
              Descartar
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={preview.itens.length === 0 || !previewCliente.trim()}
              onClick={handleSave}
            >
              Salvar no pedido
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
