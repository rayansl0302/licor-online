import { BRANDS, getProductsForBrand } from "./brands";
import { applyMarkup } from "../utils/pricing";
import type { BrandId, Product } from "../types";

export function withMarkup(
  products: Product[],
  markupPercent: number
): Product[] {
  return products.map((p) => ({
    ...p,
    preco: applyMarkup(p.preco, markupPercent),
  }));
}

export function getCatalogForBrand(
  brandId: BrandId,
  markupPercent: number
): Product[] {
  return withMarkup(getProductsForBrand(brandId), markupPercent);
}

export function getAllCatalogProducts(markupPercent: number): Product[] {
  return BRANDS.flatMap((brand) => getCatalogForBrand(brand.id, markupPercent));
}
