import { BRANDS } from "../data/brands";
import { getCatalogForBrand } from "../data/catalog";
import { formatCurrency } from "./format";
import type { Brand, BrandId } from "../types";

export type CatalogPrintScope = "todas" | BrandId;

function formatBrandCatalogTitle(brand: Brand): string {
  const nome = brand.nome.toUpperCase();
  const cidade = brand.cidade?.trim();
  const origem = cidade ? ` (DE ${cidade.toUpperCase()})` : "";
  return `━━ ${nome}${origem} ━━`;
}

function formatBrandCatalogHeading(brand: Brand): string {
  const cidade = brand.cidade?.trim();
  if (!cidade) return brand.nome;
  return `${brand.nome} (de ${cidade})`;
}

function buildCatalogSections(scope: CatalogPrintScope, markupPercent: number) {
  const brands =
    scope === "todas"
      ? BRANDS
      : BRANDS.filter((b) => b.id === scope);

  return brands.map((brand) => {
    const products = getCatalogForBrand(brand.id, markupPercent);
    const groups = brand.categorias.map((cat) => ({
      nome: cat.nome,
      items: products.filter((p) => p.categoria === cat.nome),
    }));

    return { brand, groups };
  });
}

export function formatCatalogText(
  scope: CatalogPrintScope,
  markupPercent: number
): string {
  const sections = buildCatalogSections(scope, markupPercent);
  const lines: string[] = ["CATÁLOGO DE LICORES", ""];

  for (const { brand, groups } of sections) {
    lines.push(formatBrandCatalogTitle(brand), "");

    for (const group of groups) {
      if (group.items.length === 0) continue;
      lines.push(`▸ ${group.nome}`);
      for (const item of group.items) {
        lines.push(`  • ${item.nome} — ${formatCurrency(item.preco)}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

export async function copyCatalogText(
  scope: CatalogPrintScope,
  markupPercent: number
): Promise<boolean> {
  const text = formatCatalogText(scope, markupPercent);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  }
}

export function printCatalog(
  scope: CatalogPrintScope,
  markupPercent: number
): void {
  const sections = buildCatalogSections(scope, markupPercent);

  const body = sections
    .map(({ brand, groups }) => {
      const groupsHtml = groups
        .filter((g) => g.items.length > 0)
        .map(
          (group) => `
        <h3>${group.nome}</h3>
        <table>
          <tbody>
            ${group.items
              .map(
                (item) =>
                  `<tr><td>${item.nome}</td><td class="price">${formatCurrency(item.preco)}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>`
        )
        .join("");

      return `<section class="brand-block"><h2>${formatBrandCatalogHeading(brand)}</h2>${groupsHtml}</section>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Catálogo de Licores</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; color: #111; font-size: 13px; }
    h1 { margin: 0 0 4px; font-size: 1.4rem; }
    .brand-block { margin-bottom: 24px; page-break-inside: avoid; }
    h2 { margin: 0 0 10px; font-size: 1.1rem; border-bottom: 2px solid #333; padding-bottom: 4px; }
    h3 { margin: 12px 0 6px; font-size: 0.85rem; text-transform: uppercase; color: #444; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    td { padding: 4px 6px; border-bottom: 1px solid #ddd; }
    .price { text-align: right; font-weight: 600; white-space: nowrap; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>Catálogo de Licores</h1>
  ${body}
  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=720,height=900");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
