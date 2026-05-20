import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandTabs } from "../components/BrandTabs";
import { CartPanel } from "../components/CartPanel";
import { OrderPastePanel } from "../components/OrderPastePanel";
import { ProductCatalog } from "../components/ProductCatalog";
import { useMarkup } from "../contexts/MarkupContext";
import { usePix } from "../contexts/PixContext";
import { getCatalogForBrand } from "../data/catalog";
import { getBrandById } from "../data/brands";
import { useCart } from "../hooks/useCart";
import { getFirestoreErrorMessage, saveOrder } from "../lib/orders";
import type { BrandId } from "../types";
import {
  getMarcaLabelFromItems,
  type ParseOrderResult,
} from "../utils/parseOrderText";
import { copyOrderText, printOrder } from "../utils/orderText";

interface NovoPedidoPageProps {
  onSaved: (message: string) => void;
  onGoToPedidos: () => void;
}

export function NovoPedidoPage({ onSaved, onGoToPedidos }: NovoPedidoPageProps) {
  const [brandId, setBrandId] = useState<BrandId>("roque-pinto");
  const [search, setSearch] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { markupPercent } = useMarkup();
  const { pixKey, pixBank, pixHolderName } = usePix();
  const cart = useCart();
  const products = useMemo(
    () => getCatalogForBrand(brandId, markupPercent),
    [brandId, markupPercent]
  );
  const brand = getBrandById(brandId);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--brand-color",
      brand?.cor ?? "#1e5a9e"
    );
  }, [brand?.cor]);

  const marcaLabel = useMemo(
    () =>
      cart.items.length > 0
        ? getMarcaLabelFromItems(cart.items)
        : { marcaNome: brand?.nome },
    [cart.items, brand?.nome]
  );

  const handleParseOrder = useCallback(
    (result: ParseOrderResult) => {
      if (result.clienteNome) setClienteNome(result.clienteNome);
      cart.setCartItems(result.itens);

      if (result.erros.length > 0) {
        setActionMessage(
          `Pedido parcial: ${result.itens.length} item(ns). Verifique os erros.`
        );
      } else {
        setActionMessage("Pedido montado a partir do texto!");
      }
    },
    [cart.setCartItems]
  );

  const orderSnapshot = useMemo(
    () => ({
      clienteNome: clienteNome.trim() || "Cliente",
      marcaNome: marcaLabel.marcaNome,
      itens: cart.items,
      total: cart.total,
      observacao,
      pix: {
        key: pixKey,
        bank: pixBank,
        holderName: pixHolderName,
      },
    }),
    [
      clienteNome,
      marcaLabel.marcaNome,
      cart.items,
      cart.total,
      observacao,
      pixKey,
      pixBank,
      pixHolderName,
    ]
  );

  const handleCopy = useCallback(async () => {
    if (cart.items.length === 0) return;
    const ok = await copyOrderText(orderSnapshot);
    setActionMessage(ok ? "Pedido copiado!" : "Não foi possível copiar.");
  }, [cart.items.length, orderSnapshot]);

  const handlePrint = useCallback(() => {
    if (cart.items.length === 0) return;
    printOrder(orderSnapshot);
  }, [cart.items.length, orderSnapshot]);

  const handleSave = useCallback(async () => {
    if (cart.items.length === 0 || !clienteNome.trim()) return;

    const { marcaId: mid, marcaNome } = getMarcaLabelFromItems(cart.items);

    setSaving(true);
    setActionMessage(null);

    try {
      await saveOrder({
        clienteNome: clienteNome.trim(),
        marcaId: mid,
        marcaNome,
        itens: cart.items,
        total: cart.total,
        observacao: observacao.trim(),
      });
      cart.clear();
      setClienteNome("");
      setObservacao("");
      onSaved("Pedido salvo no Firestore!");
      onGoToPedidos();
    } catch (err) {
      setActionMessage(getFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [
    cart.items,
    cart.total,
    cart.clear,
    clienteNome,
    observacao,
    onSaved,
    onGoToPedidos,
  ]);

  return (
    <div className="novo-layout">
      <OrderPastePanel onParse={handleParseOrder} />

      <div className="novo-layout__body">
        <section className="catalog-section">
          <BrandTabs activeId={brandId} onChange={setBrandId} />
          <label className="search-field">
            <span className="search-field__icon" aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              className="field__input field__input--search"
              placeholder="Buscar sabor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
                <ProductCatalog
                  brandId={brandId}
                  products={products}
                  markupPercent={markupPercent}
                  onAdd={cart.addProduct}
                  search={search}
                />
        </section>

        <CartPanel
          clienteNome={clienteNome}
          observacao={observacao}
          items={cart.items}
          total={cart.total}
          itemCount={cart.itemCount}
          saving={saving}
          onClienteChange={setClienteNome}
          onObservacaoChange={setObservacao}
          onQuantityChange={cart.changeQuantity}
          onRemove={cart.removeItem}
          onClear={cart.clear}
          onSave={handleSave}
          onCopy={handleCopy}
          onPrint={handlePrint}
        />
      </div>

      {actionMessage && (
        <p
          className={`alert ${
            actionMessage.includes("copiado") ||
            actionMessage.includes("montado")
              ? "alert--success"
              : actionMessage.includes("parcial")
                ? "alert--warn"
                : "alert--error"
          }`}
          role="status"
        >
          {actionMessage}
        </p>
      )}
    </div>
  );
}
