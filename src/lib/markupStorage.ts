const STORAGE_KEY = "licor-markup-percent";
export const DEFAULT_MARKUP_PERCENT = 60;

export function loadMarkupPercent(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MARKUP_PERCENT;
    const value = Number(raw);
    if (Number.isNaN(value)) return DEFAULT_MARKUP_PERCENT;
    return Math.min(200, Math.max(0, Math.round(value)));
  } catch {
    return DEFAULT_MARKUP_PERCENT;
  }
}

export function saveMarkupPercent(percent: number): void {
  localStorage.setItem(STORAGE_KEY, String(percent));
}
