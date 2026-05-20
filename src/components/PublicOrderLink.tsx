import { useState } from "react";
import { getPublicOrderUrl } from "../config/access";

export function PublicOrderLink() {
  const [copied, setCopied] = useState(false);
  const url = getPublicOrderUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copie o link do pedido:", url);
    }
  };

  return (
    <div className="public-order-link">
      <p className="public-order-link__label">Link para o cliente pedir</p>
      <div className="public-order-link__row">
        <input
          type="text"
          className="field__input public-order-link__input"
          value={url}
          readOnly
          aria-label="Link público de pedido"
          onFocus={(e) => e.target.select()}
        />
        <button type="button" className="btn btn--secondary btn--small" onClick={handleCopy}>
          {copied ? "Copiado!" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}
