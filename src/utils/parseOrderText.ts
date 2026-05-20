import { getAllCatalogProducts } from "../data/catalog";
import { BRANDS } from "../data/brands";
import type { BrandId, CartItem, Product } from "../types";

export interface ParseOrderResult {
  clienteNome: string;
  itens: CartItem[];
  total: number;
  erros: string[];
  avisos: string[];
}

const BRAND_ALIASES: { id: BrandId; patterns: string[] }[] = [
  {
    id: "roque-pinto",
    patterns: ["roque pinto", "roquepinto"],
  },
  {
    id: "cachoeira-colonial",
    patterns: ["cachoeira colonial", "cachoeira", "colonial"],
  },
  {
    id: "arraia",
    patterns: ["arraia do quiabo", "arraia", "quiabo"],
  },
].sort((a, b) => {
  const maxA = Math.max(...a.patterns.map((p) => p.length));
  const maxB = Math.max(...b.patterns.map((p) => p.length));
  return maxB - maxA;
});

const PRODUCT_ALIASES: Record<string, string> = {
  caja: "cajá",
  cajá: "cajá",
  "la creme": "la creme",
  "lá creme": "la creme",
  lacreme: "la creme",
  "coco cremoso": "coco",
  "chocolate cremoso": "chocolate",
  "maracuja cremoso": "maracujá cremoso",
  "maracujá cremoso": "maracujá cremoso",
  "marac cremoso": "marac cremoso",
  "milho verde cremoso": "milho verde",
  amendoim: "amendoim",
  jenipapo: "jenipapo",
  pintorulla: "pintorulla",
  beijo: "beijo",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectBrand(line: string): { brandId: BrandId | null; rest: string } {
  const normalized = normalize(line);

  for (const { id, patterns } of BRAND_ALIASES) {
    for (const pattern of patterns) {
      const normPattern = normalize(pattern);
      if (normalized.endsWith(normPattern)) {
        const rest = normalized.slice(0, normalized.length - normPattern.length).trim();
        return { brandId: id, rest };
      }
    }
  }

  return { brandId: null, rest: normalized };
}

function resolveProductName(raw: string): string {
  const norm = normalize(raw);
  return PRODUCT_ALIASES[norm] ?? norm;
}

function findProduct(
  productPart: string,
  brandId: BrandId,
  catalog: Product[]
): Product | null {
  const resolved = resolveProductName(productPart);
  const brandProducts = catalog.filter((p) => p.id.startsWith(`${brandId}-`));

  const exact = brandProducts.find(
    (p) => normalize(p.nome) === normalize(resolved)
  );
  if (exact) return exact;

  const contains = brandProducts.filter((p) => {
    const nome = normalize(p.nome);
    return nome.includes(resolved) || resolved.includes(nome);
  });

  if (contains.length === 1) return contains[0];

  if (contains.length > 1) {
    const best = contains.sort(
      (a, b) => normalize(a.nome).length - normalize(b.nome).length
    )[0];
    return best;
  }

  const words = resolved.split(" ");
  const byWords = brandProducts.find((p) => {
    const nome = normalize(p.nome);
    return words.every((w) => nome.includes(w));
  });

  return byWords ?? null;
}

function parseItemLine(
  line: string,
  catalog: Product[],
  erros: string[],
  avisos: string[]
): CartItem | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const qtyMatch = trimmed.match(/^(\d+)\s*[xX]?\s+(.+)$/);
  const quantidade = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
  const restRaw = qtyMatch ? qtyMatch[2] : trimmed;

  if (quantidade < 1 || Number.isNaN(quantidade)) {
    erros.push(`Quantidade inválida: "${trimmed}"`);
    return null;
  }

  const { brandId, rest } = detectBrand(restRaw);

  if (!brandId) {
    erros.push(`Marca não identificada: "${trimmed}"`);
    return null;
  }

  const product = findProduct(rest, brandId, catalog);

  if (!product) {
    const brandName = BRANDS.find((b) => b.id === brandId)?.nome ?? brandId;
    erros.push(`Produto não encontrado: "${rest}" (${brandName})`);
    return null;
  }

  if (normalize(rest) !== normalize(product.nome)) {
    avisos.push(`"${rest}" → ${product.nome}`);
  }

  return {
    productId: product.id,
    nome: product.nome,
    preco: product.preco,
    quantidade,
  };
}

function mergeCartItems(items: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();

  for (const item of items) {
    const existing = map.get(item.productId);
    if (existing) {
      map.set(item.productId, {
        ...existing,
        quantidade: existing.quantidade + item.quantidade,
      });
    } else {
      map.set(item.productId, { ...item });
    }
  }

  return Array.from(map.values());
}

export function parseOrderText(
  text: string,
  markupPercent: number
): ParseOrderResult {
  const catalog = getAllCatalogProducts(markupPercent);
  const erros: string[] = [];
  const avisos: string[] = [];
  let clienteNome = "";
  const parsedItems: CartItem[] = [];

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const clientMatch = line.match(/^([^:\d][^:]*?):\s*$/);
    if (clientMatch) {
      clienteNome = clientMatch[1].trim();
      continue;
    }

    const inlineClient = line.match(/^([^:\d][^:]{1,40}):\s*(.+)$/);
    if (inlineClient && !/^\d/.test(line)) {
      clienteNome = inlineClient[1].trim();
      const item = parseItemLine(inlineClient[2], catalog, erros, avisos);
      if (item) parsedItems.push(item);
      continue;
    }

    const item = parseItemLine(line, catalog, erros, avisos);
    if (item) parsedItems.push(item);
  }

  const itens = mergeCartItems(parsedItems);
  const total = itens.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  return {
    clienteNome,
    itens,
    total: Math.round(total * 100) / 100,
    erros,
    avisos,
  };
}

export function getMarcaLabelFromItems(itens: CartItem[]): {
  marcaId: BrandId;
  marcaNome: string;
} {
  const brandIds = new Set<BrandId>();

  for (const item of itens) {
    if (item.productId.startsWith("roque-pinto")) brandIds.add("roque-pinto");
    else if (item.productId.startsWith("cachoeira-colonial"))
      brandIds.add("cachoeira-colonial");
    else if (item.productId.startsWith("arraia")) brandIds.add("arraia");
  }

  const names = [...brandIds].map(
    (id) => BRANDS.find((b) => b.id === id)?.nome ?? id
  );

  if (names.length === 0) {
    return { marcaId: "roque-pinto", marcaNome: "—" };
  }

  if (names.length === 1) {
    const id = [...brandIds][0];
    return { marcaId: id, marcaNome: names[0] };
  }

  return {
    marcaId: [...brandIds][0],
    marcaNome: names.join(" + "),
  };
}
