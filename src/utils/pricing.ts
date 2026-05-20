export const MARKUP_MULTIPLIER = 1.6;

export function applyMarkup(basePrice: number): number {
  return Math.round(basePrice * MARKUP_MULTIPLIER * 100) / 100;
}
