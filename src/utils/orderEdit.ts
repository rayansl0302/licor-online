import { getCatalogForBrand } from "../data/catalog";
import type { Brand, BrandId, CartItem } from "../types";

export function syncCartItemsWithCatalog(
  items: CartItem[],
  brands: Brand[],
  brandId: BrandId,
  markupPercent: number
): CartItem[] {
  const catalog = getCatalogForBrand(brands, brandId, markupPercent);
  const byId = new Map(catalog.map((product) => [product.id, product]));

  return items
    .map((item) => {
      const product = byId.get(item.productId);
      if (!product) return item;
      return {
        ...item,
        nome: product.nome,
        preco: product.preco,
      };
    })
    .filter((item) => item.quantidade > 0);
}
