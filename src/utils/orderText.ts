import { formatCurrency } from "./format";
import type { CartItem } from "../types";

export interface OrderPixInfo {
  key?: string;
  bank?: string;
  holderName?: string;
}

export interface OrderTextInput {
  clienteNome: string;
  marcaNome?: string;
  itens: CartItem[];
  total: number;
  observacao?: string;
  pix?: OrderPixInfo;
}

function hasPixInfo(pix: OrderPixInfo | undefined): boolean {
  if (!pix) return false;
  return Boolean(pix.key?.trim() || pix.bank?.trim() || pix.holderName?.trim());
}

function appendPixLines(lines: string[], pix: OrderPixInfo | undefined) {
  if (!hasPixInfo(pix)) return;

  lines.push("");

  const holderName = pix?.holderName?.trim();
  const bank = pix?.bank?.trim();
  const key = pix?.key?.trim();

  if (holderName) lines.push(`Titular: ${holderName}`);
  if (bank) lines.push(`Banco: ${bank}`);
  if (key) lines.push(`Chave PIX: ${key}`);
}

function formatPixHtml(pix: OrderPixInfo | undefined): string {
  if (!hasPixInfo(pix)) return "";

  const parts: string[] = [];

  if (pix?.holderName?.trim()) {
    parts.push(`<strong>Titular:</strong> ${pix.holderName.trim()}`);
  }
  if (pix?.bank?.trim()) {
    parts.push(`<strong>Banco:</strong> ${pix.bank.trim()}`);
  }
  if (pix?.key?.trim()) {
    parts.push(`<strong>Chave PIX:</strong> ${pix.key.trim()}`);
  }

  return `<p class="pix">${parts.join("<br />")}</p>`;
}

export function formatOrderText(order: OrderTextInput): string {
  const lines: string[] = [`${order.clienteNome}:`];

  if (order.marcaNome) {
    lines.push(`(${order.marcaNome})`);
  }

  for (const item of order.itens) {
    lines.push(
      `${item.quantidade} ${item.nome} — ${formatCurrency(item.preco * item.quantidade)}`
    );
  }

  lines.push("", `Total: ${formatCurrency(order.total)}`);

  if (order.observacao?.trim()) {
    lines.push(`Obs: ${order.observacao.trim()}`);
  }

  appendPixLines(lines, order.pix);

  return lines.join("\n");
}

export async function copyOrderText(order: OrderTextInput): Promise<boolean> {
  const text = formatOrderText(order);
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

export function printOrder(order: OrderTextInput): void {
  const itemsHtml = order.itens
    .map(
      (item) =>
        `<tr><td>${item.quantidade}x</td><td>${item.nome}</td><td class="right">${formatCurrency(item.preco * item.quantidade)}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Pedido — ${order.clienteNome}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
    h1 { margin: 0 0 4px; font-size: 1.4rem; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 6px; border-bottom: 1px solid #ddd; text-align: left; }
    th { font-size: 0.75rem; text-transform: uppercase; color: #666; }
    .right { text-align: right; }
    .total { margin-top: 16px; font-size: 1.25rem; font-weight: 700; text-align: right; }
    .obs { margin-top: 12px; font-style: italic; color: #444; }
    .pix { margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 8px; line-height: 1.5; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>${order.clienteNome}</h1>
  ${order.marcaNome ? `<p class="meta">${order.marcaNome}</p>` : ""}
  <table>
    <thead><tr><th>Qtd</th><th>Item</th><th class="right">Valor</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <p class="total">Total: ${formatCurrency(order.total)}</p>
  ${order.observacao?.trim() ? `<p class="obs">Obs: ${order.observacao.trim()}</p>` : ""}
  ${formatPixHtml(order.pix)}
  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=480,height=640");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
