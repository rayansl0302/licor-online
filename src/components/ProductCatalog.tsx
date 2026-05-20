import { CatalogContext } from "../contexts/CatalogContext";
import { useContext } from "react";
import { getBrandById } from "../data/brands";
import { formatCurrency } from "../utils/format";
import { formatMarkupLabel } from "../utils/pricing";
import type { Brand, BrandId, Product } from "../types";

interface ProductCatalogProps {
  brandId: BrandId;
  products: Product[];
  markupPercent: number;
  onAdd: (product: Product) => void;
  search: string;
  readOnly?: boolean;
  brands?: Brand[];
  showMarkupLabel?: boolean;
}

export function ProductCatalog({
  brandId,
  products,
  markupPercent,
  onAdd,
  search,
  readOnly = false,
  brands: brandsProp,
  showMarkupLabel = true,
}: ProductCatalogProps) {
  const catalog = useContext(CatalogContext);
  const brands = brandsProp ?? catalog?.brands ?? [];
  const brand = getBrandById(brands, brandId);
  if (!brand) return null;

  const term = search.trim().toLowerCase();
  const filtered = term
    ? products.filter((p) => p.nome.toLowerCase().includes(term))
    : products;

  const byCategory = brand.categorias.map((cat) => ({
    nome: cat.nome,
    items: filtered.filter((p) => p.categoria === cat.nome),
  }));

  return (
    <section className="catalog" aria-label="Lista de licores">
      {byCategory.map(
        (group) =>
          group.items.length > 0 && (
            <div key={group.nome} className="catalog-group">
              <h3 className="catalog-group__title">{group.nome}</h3>
              <ul className="catalog-list">
                {group.items.map((product) => (
                  <li key={product.id} className="catalog-item">
                    <div className="catalog-item__info">
                      <span className="catalog-item__name">{product.nome}</span>
                      <span className="catalog-item__price">
                        {formatCurrency(product.preco)}
                        {showMarkupLabel && (
                          <span className="catalog-item__markup">
                            {formatMarkupLabel(markupPercent)}
                          </span>
                        )}
                      </span>
                    </div>
                    {!readOnly && (
                      <button
                        type="button"
                        className="btn btn--add"
                        aria-label={`Adicionar ${product.nome}`}
                        onClick={() => onAdd(product)}
                      >
                        +
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
      )}
      {filtered.length === 0 && (
        <p className="empty-hint">Nenhum licor encontrado para essa busca.</p>
      )}
    </section>
  );
}
