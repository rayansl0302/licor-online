const STORAGE_KEY = "licor-pix-settings";
const LEGACY_KEY = "licor-pix-key";

export interface PixSettings {
  key: string;
  bank: string;
  holderName: string;
}

const EMPTY_PIX_SETTINGS: PixSettings = {
  key: "",
  bank: "",
  holderName: "",
};

function normalizePixSettings(value: unknown): PixSettings {
  if (!value || typeof value !== "object") return EMPTY_PIX_SETTINGS;

  const data = value as Record<string, unknown>;

  return {
    key: typeof data.key === "string" ? data.key.trim() : "",
    bank: typeof data.bank === "string" ? data.bank.trim() : "",
    holderName:
      typeof data.holderName === "string" ? data.holderName.trim() : "",
  };
}

export function loadPixSettings(): PixSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizePixSettings(JSON.parse(raw));

    const legacyKey = localStorage.getItem(LEGACY_KEY)?.trim() ?? "";
    return { ...EMPTY_PIX_SETTINGS, key: legacyKey };
  } catch {
    return EMPTY_PIX_SETTINGS;
  }
}

export function savePixSettings(settings: PixSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizePixSettings(settings)));
}
