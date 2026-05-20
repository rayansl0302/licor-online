import { getCatalogForBrand } from "../data/catalog";
import type { BrandId, CartItem } from "../types";

export function syncCartItemsWithCatalog(
  items: CartItem[],
  brandId: BrandId,
  markupPercent: number
): CartItem[] {
  const catalog = getCatalogForBrand(brandId, markupPercent);
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
