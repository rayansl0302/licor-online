export function applyMarkup(basePrice: number, markupPercent: number): number {
  const multiplier = 1 + markupPercent / 100;
  return Math.round(basePrice * multiplier * 100) / 100;
}

export function formatMarkupLabel(markupPercent: number): string {
  return `+${markupPercent}%`;
}
