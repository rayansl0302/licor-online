import { useCallback, useEffect, useMemo, useState } from "react";
import { CartPanel } from "./CartPanel";
import { ProductCatalog } from "./ProductCatalog";
import { useCatalog } from "../contexts/CatalogContext";
import { useMarkup } from "../contexts/MarkupContext";
import { usePix } from "../contexts/PixContext";
import { getCatalogForBrand } from "../data/catalog";
import { getBrandById } from "../data/brands";
import { useCart } from "../hooks/useCart";
import { getFirestoreErrorMessage, updateOrder } from "../lib/orders";
import type { Order } from "../types";
import { syncCartItemsWithCatalog } from "../utils/orderEdit";
import { getMarcaLabelFromItems } from "../utils/parseOrderText";
import { copyOrderText, printOrder } from "../utils/orderText";
import "./OrderEditModal.css";

interface OrderEditModalProps {
  order: Order | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function OrderEditModal({ order, onClose, onSaved }: OrderEditModalProps) {
  const { brands } = useCatalog();
  const { markupPercent } = useMarkup();
  const { pixKey, pixBank, pixHolderName } = usePix();
  const cart = useCart();

  const [search, setSearch] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const brandId = order?.marcaId ?? "roque-pinto";
  const products = useMemo(
    () => getCatalogForBrand(brands, brandId, markupPercent),
    [brands, brandId, markupPercent]
  );
  const brand = getBrandById(brands, brandId);

  useEffect(() => {
    if (!order) return;

    setClienteNome(order.clienteNome);
    setObservacao(order.observacao);
    setSearch("");
    setActionMessage(null);
    cart.setCartItems(
      syncCartItemsWithCatalog(order.itens, brands, order.marcaId, markupPercent)
    );
  }, [order?.id, order?.clienteNome, order?.observacao, order?.itens, order?.marcaId, markupPercent, brands]);

  useEffect(() => {
    if (!order) return;
    document.documentElement.style.setProperty(
      "--brand-color",
      brand?.cor ?? "#1e5a9e"
    );
  }, [order, brand?.cor]);

  useEffect(() => {
    if (!order) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [order, onClose]);

  const marcaLabel = useMemo(
    () =>
      cart.items.length > 0
        ? getMarcaLabelFromItems(cart.items, brands)
        : { marcaId: brandId, marcaNome: order?.marcaNome ?? brand?.nome ?? "" },
    [cart.items, brandId, order?.marcaNome, brand?.nome, brands]
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
    if (!order || cart.items.length === 0 || !clienteNome.trim()) return;

    const { marcaId: mid, marcaNome } = getMarcaLabelFromItems(cart.items, brands);

    setSaving(true);
    setActionMessage(null);

    try {
      await updateOrder(order.id, {
        clienteNome: clienteNome.trim(),
        marcaId: mid,
        marcaNome,
        itens: cart.items,
        total: cart.total,
        observacao: observacao.trim(),
      });
      onSaved("Pedido atualizado!");
      onClose();
    } catch (err) {
      setActionMessage(getFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [
    order,
    cart.items,
    cart.total,
    clienteNome,
    observacao,
    onSaved,
    onClose,
  ]);

  if (!order) return null;

  return (
    <div className="order-edit-modal" role="presentation">
      <button
        type="button"
        className="order-edit-modal__backdrop"
        aria-label="Fechar edição"
        onClick={onClose}
      />

      <div
        className="order-edit-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-edit-title"
      >
        <header className="order-edit-modal__header">
          <div>
            <h2 id="order-edit-title" className="order-edit-modal__title">
              Editar pedido
            </h2>
            <p className="order-edit-modal__subtitle">
              {order.marcaNome} · ajuste sabores e quantidades
            </p>
          </div>
          <button
            type="button"
            className="btn btn--secondary btn--small"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="order-edit-modal__body">
          <section className="catalog-section order-edit-modal__catalog">
            <label className="search-field">
              <span className="search-field__icon" aria-hidden>
                ⌕
              </span>
              <input
                type="search"
                className="field__input field__input--search"
                placeholder="Buscar sabor para adicionar…"
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
            saveLabel="Salvar alterações"
            showClear={false}
            onClienteChange={setClienteNome}
            onObservacaoChange={setObservacao}
            onQuantityChange={cart.changeQuantity}
            onRemove={cart.removeItem}
            onClear={cart.clear}
            onSave={handleSave}
            onCopy={handleCopy}
            onPrint={handlePrint}
            onCancel={onClose}
          />
        </div>

        {actionMessage && (
          <p
            className={`alert order-edit-modal__alert ${
              actionMessage.includes("copiado") || actionMessage.includes("atualizado")
                ? "alert--success"
                : "alert--error"
            }`}
            role="status"
          >
            {actionMessage}
          </p>
        )}
      </div>
    </div>
  );
}
