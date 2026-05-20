import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandTabs } from "../components/BrandTabs";
import { CartPanel } from "../components/CartPanel";
import { ProductCatalog } from "../components/ProductCatalog";
import { usePublicCatalog } from "../contexts/PublicCatalogContext";
import { getCatalogForBrand } from "../data/catalog";
import { getBrandById, getDefaultBrandId } from "../data/brands";
import { useCart } from "../hooks/useCart";
import { getFirestoreErrorMessage, savePublicOrder } from "../lib/orders";
import type { BrandId } from "../types";
import { getMarcaLabelFromItems } from "../utils/parseOrderText";
import { copyOrderText } from "../utils/orderText";
import "./PublicOrderPage.css";

export function PublicOrderPage() {
  const { brands, markupPercent, loading, error } = usePublicCatalog();
  const [brandId, setBrandId] = useState<BrandId>(() => getDefaultBrandId(brands));
  const [search, setSearch] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const cart = useCart();

  useEffect(() => {
    if (!brands.some((brand) => brand.id === brandId)) {
      setBrandId(getDefaultBrandId(brands));
    }
  }, [brands, brandId]);

  const products = useMemo(
    () => getCatalogForBrand(brands, brandId, markupPercent),
    [brands, brandId, markupPercent]
  );

  const brand = getBrandById(brands, brandId);

  const marcaLabel = useMemo(
    () =>
      cart.items.length > 0
        ? getMarcaLabelFromItems(cart.items, brands)
        : { marcaNome: brand?.nome },
    [cart.items, brand?.nome, brands]
  );

  const orderSnapshot = useMemo(
    () => ({
      clienteNome: clienteNome.trim() || "Cliente",
      marcaNome: marcaLabel.marcaNome,
      itens: cart.items,
      total: cart.total,
      observacao,
    }),
    [clienteNome, marcaLabel.marcaNome, cart.items, cart.total, observacao]
  );

  const handleCopy = useCallback(async () => {
    if (!clienteNome.trim()) {
      setFeedback("Informe seu nome para copiar o pedido.");
      return;
    }
    if (cart.items.length === 0) return;

    const ok = await copyOrderText(orderSnapshot);
    setFeedback(
      ok ? "Pedido copiado! Cole no WhatsApp." : "Não foi possível copiar."
    );
  }, [clienteNome, cart.items.length, orderSnapshot]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--brand-color",
      brand?.cor ?? "#1e5a9e"
    );
  }, [brand?.cor]);

  const handleSave = async () => {
    if (cart.items.length === 0 || !clienteNome.trim()) return;

    const { marcaId: mid, marcaNome } = getMarcaLabelFromItems(cart.items, brands);

    setSaving(true);
    setFeedback(null);

    try {
      await savePublicOrder({
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
      setSubmitted(true);
    } catch (err) {
      setFeedback(getFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleNewOrder = () => {
    setSubmitted(false);
    setFeedback(null);
  };

  if (submitted) {
    return (
      <div className="public-order">
        <main className="public-order__success">
          <h1 className="public-order__title">Pedido enviado!</h1>
          <p className="public-order__subtitle">
            Recebemos seu pedido. Em breve entraremos em contato para confirmar.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleNewOrder}
          >
            Fazer outro pedido
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="public-order">
      <header className="public-order__header">
        <h1 className="public-order__title">Fazer pedido</h1>
        <p className="public-order__subtitle">
          Escolha os licores, informe seu nome, copie para o WhatsApp ou envie o
          pedido aqui.
        </p>
      </header>

      {error && (
        <p className="alert alert--warn public-order__banner" role="status">
          {error}
        </p>
      )}

      {loading ? (
        <p className="empty-hint public-order__loading">Carregando catálogo…</p>
      ) : (
        <div className="public-order__layout">
          <section className="catalog-section public-order__catalog">
            <BrandTabs activeId={brandId} onChange={setBrandId} brands={brands} />
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
              brands={brands}
              showMarkupLabel={false}
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
            onPrint={() => {}}
            saveLabel="Enviar pedido"
            showClear
            showCopy
            showPrint={false}
            copyLabel="Copiar para WhatsApp"
            clienteLabel="Seu nome *"
            emptyHint="Toque em + na lista para adicionar licores ao pedido."
          />
        </div>
      )}

      {feedback && (
        <p
          className={`alert public-order__banner ${
            feedback.includes("copiado") ? "alert--success" : "alert--error"
          }`}
          role="status"
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
