import { CatalogContext } from "../contexts/CatalogContext";
import { useContext } from "react";
import type { CSSProperties } from "react";
import type { Brand, BrandId } from "../types";

interface BrandTabsProps {
  activeId: BrandId;
  onChange: (id: BrandId) => void;
  brands?: Brand[];
}

export function BrandTabs({ activeId, onChange, brands: brandsProp }: BrandTabsProps) {
  const catalog = useContext(CatalogContext);
  const brands = brandsProp ?? catalog?.brands ?? [];

  if (brands.length === 0) return null;

  return (
    <div className="brand-tabs" role="tablist" aria-label="Marcas de licor">
      {brands.map((brand) => (
        <button
          key={brand.id}
          type="button"
          role="tab"
          aria-selected={activeId === brand.id}
          className={`brand-tab ${activeId === brand.id ? "brand-tab--active" : ""}`}
          style={
            activeId === brand.id
              ? ({ "--brand-color": brand.cor } as CSSProperties)
              : undefined
          }
          onClick={() => onChange(brand.id)}
        >
          {brand.nome}
        </button>
      ))}
    </div>
  );
}
