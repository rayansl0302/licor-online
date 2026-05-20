import { BRANDS, getProductsForBrand } from "./brands";
import { applyMarkup } from "../utils/pricing";
import type { BrandId, Product } from "../types";

export function withMarkup(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    preco: applyMarkup(p.preco),
  }));
}

export function getCatalogForBrand(brandId: BrandId): Product[] {
  return withMarkup(getProductsForBrand(brandId));
}

export function getAllCatalogProducts(): Product[] {
  return BRANDS.flatMap((brand) => getCatalogForBrand(brand.id));
}
