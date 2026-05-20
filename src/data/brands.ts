import type { Brand, BrandId, Product } from "../types";

export function buildProductId(
  marcaId: string,
  categoria: string,
  nome: string
): string {
  const slug = `${categoria}-${nome}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${marcaId}-${slug}`;
}

function buildProducts(
  marcaId: string,
  categoria: string,
  items: { nome: string; preco: number }[]
): Product[] {
  return items.map((item) => ({
    id: buildProductId(marcaId, categoria, item.nome),
    nome: item.nome,
    preco: item.preco,
    categoria,
  }));
}

export function getProductsForBrand(
  brands: Brand[],
  brandId: string
): Product[] {
  const brand = brands.find((b) => b.id === brandId);
  if (!brand) return [];

  return brand.categorias.flatMap((cat) =>
    buildProducts(brand.id, cat.nome, cat.produtos)
  );
}

export function getBrandById(brands: Brand[], brandId: string) {
  return brands.find((b) => b.id === brandId);
}

export function slugifyBrandId(nome: string): string {
  const slug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "fornecedor";
}

export function createUniqueBrandId(nome: string, existingIds: string[]): string {
  const base = slugifyBrandId(nome);
  if (!existingIds.includes(base)) return base;

  let suffix = 2;
  while (existingIds.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export function getDefaultBrandId(brands: Brand[]): BrandId {
  if (brands.length === 0) return "roque-pinto";
  const preferred = brands.find((b) => b.id === "roque-pinto");
  return preferred?.id ?? brands[0].id;
}

export function extractBrandIdFromProductId(
  productId: string,
  brands: Brand[]
): BrandId | null {
  const sorted = [...brands].sort((a, b) => b.id.length - a.id.length);

  for (const brand of sorted) {
    if (productId === brand.id || productId.startsWith(`${brand.id}-`)) {
      return brand.id;
    }
  }

  return null;
}

export function cloneBrands(brands: Brand[]): Brand[] {
  return brands.map((brand) => ({
    ...brand,
    categorias: brand.categorias.map((cat) => ({
      ...cat,
      produtos: cat.produtos.map((p) => ({ ...p })),
    })),
  }));
}

export function getCategoriesForBrand(
  brands: Brand[],
  brandId: BrandId
): string[] {
  const brand = getBrandById(brands, brandId);
  if (!brand) return [];
  return brand.categorias.map((cat) => cat.nome);
}
