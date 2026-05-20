import { useCatalog } from "../contexts/CatalogContext";
import type { CSSProperties } from "react";
import type { BrandId } from "../types";

interface BrandTabsProps {
  activeId: BrandId;
  onChange: (id: BrandId) => void;
}

export function BrandTabs({ activeId, onChange }: BrandTabsProps) {
  const { brands } = useCatalog();

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
