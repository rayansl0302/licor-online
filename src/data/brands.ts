import type { Brand, Product } from "../types";

function buildProducts(
  marcaId: string,
  categoria: string,
  items: { nome: string; preco: number }[]
): Product[] {
  return items.map((item) => ({
    id: `${marcaId}-${categoria}-${item.nome}`.toLowerCase().replace(/\s+/g, "-"),
    nome: item.nome,
    preco: item.preco,
    categoria,
  }));
}

export const BRANDS: Brand[] = [
  {
    id: "arraia",
    nome: "Arraiá do Quiabo",
    cor: "#f5c518",
    categorias: [
      {
        nome: "Tradicionais",
        produtos: [
          { nome: "Jenipapo", preco: 18 },
          { nome: "Acerola", preco: 18 },
          { nome: "Ameixa", preco: 18 },
          { nome: "Amendoim", preco: 18 },
          { nome: "Cajá", preco: 18 },
          { nome: "Passas", preco: 18 },
          { nome: "Gengibre", preco: 18 },
          { nome: "Maracujá", preco: 18 },
          { nome: "Limão", preco: 18 },
          { nome: "Tamarindo", preco: 18 },
          { nome: "Goiaba", preco: 18 },
          { nome: "Menta", preco: 18 },
        ],
      },
      {
        nome: "Cremosos",
        produtos: [
          { nome: "Milho Verde", preco: 19 },
          { nome: "Maracujá Cremoso", preco: 20 },
          { nome: "Graviola", preco: 19 },
          { nome: "Cupuaçu", preco: 19 },
          { nome: "Café", preco: 19 },
          { nome: "Açaí", preco: 19 },
          { nome: "Coco", preco: 19 },
          { nome: "Chocolate", preco: 20 },
          { nome: "Morango", preco: 20 },
        ],
      },
      {
        nome: "Finos",
        produtos: [
          { nome: "Banana", preco: 19 },
          { nome: "Caju", preco: 19 },
          { nome: "Jabuticaba", preco: 20 },
        ],
      },
    ],
  },
  {
    id: "roque-pinto",
    nome: "Licores Roque Pinto",
    cidade: "Cachoeira",
    cor: "#1e5a9e",
    categorias: [
      {
        nome: "Tradicionais",
        produtos: [
          { nome: "Ameixa", preco: 18 },
          { nome: "Cajá", preco: 18 },
          { nome: "Cupuaçu", preco: 18 },
          { nome: "Gengibre", preco: 18 },
          { nome: "Graviola", preco: 18 },
          { nome: "Hortelã", preco: 18 },
          { nome: "Jenipapo", preco: 18 },
          { nome: "Limão", preco: 18 },
          { nome: "Maracujá", preco: 18 },
          { nome: "Passas", preco: 18 },
          { nome: "Pimenta", preco: 18 },
          { nome: "Rabo de Foguete", preco: 18 },
          { nome: "Tamarindo", preco: 18 },
          { nome: "Açaí", preco: 19 },
        ],
      },
      {
        nome: "Especiais",
        produtos: [
          { nome: "Amendoim", preco: 19 },
          { nome: "Cacau", preco: 19 },
          { nome: "Café", preco: 18 },
          { nome: "Chocolate", preco: 19 },
          { nome: "Coco", preco: 19 },
          { nome: "Maracujá Cremoso", preco: 20 },
          { nome: "Morango", preco: 20 },
          { nome: "Beijo", preco: 37 },
          { nome: "La Creme", preco: 37 },
          { nome: "Pintorulla", preco: 37 },
        ],
      },
    ],
  },
  {
    id: "cachoeira-colonial",
    nome: "Cachoeira Colonial",
    cidade: "Cachoeira",
    cor: "#5a9e6f",
    categorias: [
      {
        nome: "Tradicionais",
        produtos: [
          { nome: "Acerola", preco: 16 },
          { nome: "Ameixa", preco: 16 },
          { nome: "Cajá", preco: 16 },
          { nome: "Gengibre", preco: 16 },
          { nome: "Goiaba", preco: 16 },
          { nome: "Jenipapo", preco: 16 },
          { nome: "Maracujá", preco: 16 },
          { nome: "Menta", preco: 16 },
          { nome: "Passas", preco: 16 },
          { nome: "Tamarindo", preco: 16 },
          { nome: "Limão", preco: 16 },
        ],
      },
      {
        nome: "Cremosos",
        produtos: [
          { nome: "Amendoim", preco: 18 },
          { nome: "Café", preco: 18 },
          { nome: "Chocolate", preco: 18 },
          { nome: "Cupuaçu", preco: 18 },
          { nome: "Graviola", preco: 18 },
          { nome: "Marac Cremoso", preco: 18 },
          { nome: "Milho Verde", preco: 18 },
        ],
      },
      {
        nome: "Especiais",
        produtos: [
          { nome: "Caju", preco: 20 },
          { nome: "Jabuticaba", preco: 20 },
          { nome: "Pitanga", preco: 23 },
          { nome: "Sangue Latino", preco: 20 },
          { nome: "Umbuky", preco: 20 },
          { nome: "Doce Colonial", preco: 30 },
        ],
      },
    ],
  },
];

export function getProductsForBrand(brandId: string): Product[] {
  const brand = BRANDS.find((b) => b.id === brandId);
  if (!brand) return [];

  return brand.categorias.flatMap((cat) =>
    buildProducts(brand.id, cat.nome, cat.produtos)
  );
}

export function getBrandById(brandId: string) {
  return BRANDS.find((b) => b.id === brandId);
}
