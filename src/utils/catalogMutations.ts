import { buildProductId, createUniqueBrandId } from "../data/brands";
import type { Brand, BrandId } from "../types";

export function addCatalogBrand(
  brands: Brand[],
  input: { nome: string; cidade?: string; cor?: string }
): Brand[] {
  const nomeTrim = input.nome.trim();
  if (!nomeTrim) return brands;

  const id = createUniqueBrandId(
    nomeTrim,
    brands.map((brand) => brand.id)
  );
  const cor = input.cor?.trim() || "#1e5a9e";
  const cidade = input.cidade?.trim() || undefined;

  return [
    ...brands,
    {
      id,
      nome: nomeTrim,
      cor,
      cidade,
      categorias: [{ nome: "Tradicionais", produtos: [] }],
    },
  ];
}

function updateBrand(
  brands: Brand[],
  brandId: BrandId,
  updater: (brand: Brand) => Brand
): Brand[] {
  return brands.map((brand) => (brand.id === brandId ? updater(brand) : brand));
}

export function addCatalogProduct(
  brands: Brand[],
  brandId: BrandId,
  categoria: string,
  nome: string,
  preco: number
): Brand[] {
  const nomeTrim = nome.trim();
  const categoriaTrim = categoria.trim();
  if (!nomeTrim || !categoriaTrim || preco < 0) return brands;

  return updateBrand(brands, brandId, (brand) => {
    const existingCategory = brand.categorias.find(
      (cat) => cat.nome.toLowerCase() === categoriaTrim.toLowerCase()
    );

    if (existingCategory) {
      const duplicate = existingCategory.produtos.some(
        (p) => p.nome.toLowerCase() === nomeTrim.toLowerCase()
      );
      if (duplicate) return brand;

      return {
        ...brand,
        categorias: brand.categorias.map((cat) =>
          cat.nome === existingCategory.nome
            ? {
                ...cat,
                produtos: [...cat.produtos, { nome: nomeTrim, preco }],
              }
            : cat
        ),
      };
    }

    return {
      ...brand,
      categorias: [
        ...brand.categorias,
        { nome: categoriaTrim, produtos: [{ nome: nomeTrim, preco }] },
      ],
    };
  });
}

export function removeCatalogProduct(
  brands: Brand[],
  brandId: BrandId,
  categoria: string,
  productId: string
): Brand[] {
  return updateBrand(brands, brandId, (brand) => ({
    ...brand,
    categorias: brand.categorias
      .map((cat) => {
        if (cat.nome !== categoria) return cat;
        return {
          ...cat,
          produtos: cat.produtos.filter(
            (p) => buildProductId(brand.id, cat.nome, p.nome) !== productId
          ),
        };
      })
      .filter((cat) => cat.produtos.length > 0),
  }));
}

export function updateCatalogProduct(
  brands: Brand[],
  brandId: BrandId,
  categoria: string,
  productId: string,
  patch: { nome?: string; preco?: number }
): Brand[] {
  return updateBrand(brands, brandId, (brand) => ({
    ...brand,
    categorias: brand.categorias.map((cat) => {
      if (cat.nome !== categoria) return cat;

      return {
        ...cat,
        produtos: cat.produtos.map((p) => {
          if (buildProductId(brand.id, cat.nome, p.nome) !== productId) return p;

          const nome = patch.nome !== undefined ? patch.nome.trim() : p.nome;
          const preco = patch.preco !== undefined ? patch.preco : p.preco;

          return { nome, preco };
        }),
      };
    }),
  }));
}
