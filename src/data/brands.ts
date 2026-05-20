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
