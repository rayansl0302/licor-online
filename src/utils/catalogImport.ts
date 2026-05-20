import { cloneBrands } from "../data/brands";
import { DEFAULT_BRANDS } from "../data/defaultBrands";
import type { Brand, BrandId } from "../types";

const VALID_BRAND_IDS: BrandId[] = [
  "arraia",
  "roque-pinto",
  "cachoeira-colonial",
];

export interface CatalogExportFile {
  version: number;
  descricao?: string;
  brands: Brand[];
}

export interface CatalogImportResult {
  brands: Brand[];
  avisos: string[];
  erros: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePreco(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", ".").trim());
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
  }
  return null;
}

function normalizeBrandId(value: unknown): BrandId | null {
  if (typeof value !== "string") return null;
  const id = value.trim() as BrandId;
  return VALID_BRAND_IDS.includes(id) ? id : null;
}

function normalizeBrand(raw: unknown, erros: string[], index: number): Brand | null {
  if (!isRecord(raw)) {
    erros.push(`Marca #${index + 1}: formato inválido.`);
    return null;
  }

  const id = normalizeBrandId(raw.id);
  if (!id) {
    erros.push(`Marca #${index + 1}: id inválido (use arraia, roque-pinto ou cachoeira-colonial).`);
    return null;
  }

  const nome = typeof raw.nome === "string" ? raw.nome.trim() : "";
  if (!nome) {
    erros.push(`Marca "${id}": nome obrigatório.`);
    return null;
  }

  const cor = typeof raw.cor === "string" && raw.cor.trim() ? raw.cor.trim() : "#1e5a9e";
  const cidade =
    typeof raw.cidade === "string" && raw.cidade.trim() ? raw.cidade.trim() : undefined;

  if (!Array.isArray(raw.categorias)) {
    erros.push(`Marca "${nome}": categorias deve ser uma lista.`);
    return null;
  }

  const categorias: Brand["categorias"] = [];

  raw.categorias.forEach((catRaw, catIndex) => {
    if (!isRecord(catRaw)) {
      erros.push(`Marca "${nome}", categoria #${catIndex + 1}: formato inválido.`);
      return;
    }

    const catNome = typeof catRaw.nome === "string" ? catRaw.nome.trim() : "";
    if (!catNome) {
      erros.push(`Marca "${nome}", categoria #${catIndex + 1}: nome obrigatório.`);
      return;
    }

    if (!Array.isArray(catRaw.produtos)) {
      erros.push(`Marca "${nome}", "${catNome}": produtos deve ser uma lista.`);
      return;
    }

    const produtos: { nome: string; preco: number }[] = [];

    catRaw.produtos.forEach((prodRaw, prodIndex) => {
      if (!isRecord(prodRaw)) {
        erros.push(
          `Marca "${nome}", "${catNome}", item #${prodIndex + 1}: formato inválido.`
        );
        return;
      }

      const prodNome = typeof prodRaw.nome === "string" ? prodRaw.nome.trim() : "";
      const preco = parsePreco(prodRaw.preco);

      if (!prodNome) {
        erros.push(
          `Marca "${nome}", "${catNome}", item #${prodIndex + 1}: nome obrigatório.`
        );
        return;
      }

      if (preco === null) {
        erros.push(
          `Marca "${nome}", "${catNome}", "${prodNome}": preço base inválido.`
        );
        return;
      }

      produtos.push({ nome: prodNome, preco });
    });

    if (produtos.length > 0) {
      categorias.push({ nome: catNome, produtos });
    }
  });

  if (categorias.length === 0) {
    erros.push(`Marca "${nome}": nenhum produto válido.`);
    return null;
  }

  return { id, nome, cor, cidade, categorias };
}

export function parseCatalogImportJson(text: string): CatalogImportResult {
  const erros: string[] = [];
  const avisos: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { brands: [], avisos, erros: ["JSON inválido. Verifique vírgulas e aspas."] };
  }

  const root = isRecord(parsed) ? parsed : null;
  if (!root) {
    return { brands: [], avisos, erros: ["O arquivo deve ser um objeto JSON."] };
  }

  const brandsRaw = Array.isArray(root.brands)
    ? root.brands
    : Array.isArray(parsed)
      ? parsed
      : null;

  if (!brandsRaw) {
    return {
      brands: [],
      avisos,
      erros: ['Use o formato { "version": 1, "brands": [ ... ] }'],
    };
  }

  const brands: Brand[] = [];

  brandsRaw.forEach((brandRaw, index) => {
    const brand = normalizeBrand(brandRaw, erros, index);
    if (brand) brands.push(brand);
  });

  if (brands.length === 0 && erros.length === 0) {
    erros.push("Nenhuma marca válida encontrada no arquivo.");
  }

  const ids = new Set(brands.map((b) => b.id));
  VALID_BRAND_IDS.forEach((id) => {
    if (!ids.has(id)) {
      avisos.push(`Marca "${id}" não está no JSON — ficará vazia até você adicionar.`);
    }
  });

  return { brands: cloneBrands(brands), avisos, erros };
}

export function buildCatalogExportFile(brands: Brand[]): CatalogExportFile {
  return {
    version: 1,
    descricao: "Exportado do app Licor — preços base (sem lucro)",
    brands: cloneBrands(brands),
  };
}

export function buildCatalogExportJson(brands: Brand[]): string {
  return `${JSON.stringify(buildCatalogExportFile(brands), null, 2)}\n`;
}

export function getDefaultCatalogExportJson(): string {
  return buildCatalogExportJson(DEFAULT_BRANDS);
}

export function downloadCatalogJson(
  brands: Brand[],
  filename = "catalogo-licores.json"
): void {
  const blob = new Blob([buildCatalogExportJson(brands)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
