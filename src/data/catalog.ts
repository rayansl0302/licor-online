import { getProductsForBrand as getProducts } from "./brands";
import { applyMarkup } from "../utils/pricing";
import type { Brand, BrandId, Product } from "../types";

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
  brands: Brand[],
  brandId: BrandId,
  markupPercent: number
): Product[] {
  return withMarkup(getProducts(brands, brandId), markupPercent);
}

export function getAllCatalogProducts(
  brands: Brand[],
  markupPercent: number
): Product[] {
  return brands.flatMap((brand) =>
    getCatalogForBrand(brands, brand.id, markupPercent)
  );
}
