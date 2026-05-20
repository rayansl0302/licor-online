import { useMemo, useState } from "react";
import { BrandTabs } from "../components/BrandTabs";
import { CatalogEditor } from "../components/CatalogEditor";
import { CatalogImportPanel } from "../components/CatalogImportPanel";
import { ProductCatalog } from "../components/ProductCatalog";
import { useCatalog } from "../contexts/CatalogContext";
import { useMarkup } from "../contexts/MarkupContext";
import { getCatalogForBrand } from "../data/catalog";
import {
  copyCatalogText,
  printCatalog,
  type CatalogPrintScope,
} from "../utils/catalogPrint";
import { formatMarkupLabel } from "../utils/pricing";
import type { BrandId } from "../types";

export function CatalogoPage() {
  const { brands } = useCatalog();
  const { markupPercent, setMarkupPercent } = useMarkup();
  const [brandId, setBrandId] = useState<BrandId>("roque-pinto");
  const [printScope, setPrintScope] = useState<CatalogPrintScope>("todas");
  const [editMode, setEditMode] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const products = useMemo(
    () => getCatalogForBrand(brands, brandId, markupPercent),
    [brands, brandId, markupPercent]
  );

  const handleCopy = async () => {
    const ok = await copyCatalogText(brands, printScope, markupPercent);
    setFeedback(ok ? "Catálogo copiado! Cole no WhatsApp." : "Não foi possível copiar.");
  };

  const handlePrint = () => {
    printCatalog(brands, printScope, markupPercent);
    setFeedback("Abrindo impressão do catálogo…");
  };

  return (
    <div className="catalogo-page">
      <header className="page-header">
        <h2 className="page-header__title">Catálogo para WhatsApp</h2>
        <p className="page-header__subtitle">
          Ajuste o lucro, edite sabores e preços base, copie ou imprima para enviar.
        </p>
      </header>

      <section className="markup-panel">
        <label className="field markup-field">
          <span className="field__label">Lucro sobre o preço base (%)</span>
          <div className="markup-field__row">
            <input
              type="range"
              className="markup-field__range"
              min={0}
              max={150}
              step={1}
              value={markupPercent}
              onChange={(e) => setMarkupPercent(Number(e.target.value))}
            />
            <input
              type="number"
              className="field__input markup-field__number"
              min={0}
              max={200}
              value={markupPercent}
              onChange={(e) => setMarkupPercent(Number(e.target.value))}
            />
            <span className="markup-field__label">{formatMarkupLabel(markupPercent)}</span>
          </div>
        </label>

        <label className="field">
          <span className="field__label">Imprimir / copiar</span>
          <select
            className="field__input"
            value={printScope}
            onChange={(e) =>
              setPrintScope(
                e.target.value === "todas" ? "todas" : (e.target.value as BrandId)
              )
            }
          >
            <option value="todas">Todas as marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="catalogo-actions">
          <button type="button" className="btn btn--secondary" onClick={handleCopy}>
            Copiar para WhatsApp
          </button>
          <button type="button" className="btn btn--primary" onClick={handlePrint}>
            Imprimir catálogo
          </button>
        </div>

        {feedback && (
          <p className="alert alert--success" role="status">
            {feedback}
          </p>
        )}

        <CatalogImportPanel />
      </section>

      <section className="catalog-section">
        <div className="catalog-section__head">
          <h3 className="section-title">Pré-visualização</h3>
          <button
            type="button"
            className={`btn btn--small ${editMode ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? "Ver catálogo" : "Editar catálogo"}
          </button>
        </div>

        <BrandTabs activeId={brandId} onChange={setBrandId} />

        {editMode ? (
          <CatalogEditor brandId={brandId} />
        ) : (
          <ProductCatalog
            brandId={brandId}
            products={products}
            markupPercent={markupPercent}
            onAdd={() => {}}
            search=""
            readOnly
          />
        )}
      </section>
    </div>
  );
}
