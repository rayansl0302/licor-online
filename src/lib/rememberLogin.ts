const STORAGE_KEY = "licor-remember-session";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface RememberSession {
  email: string;
  remember: boolean;
  expiresAt: number;
  savedAt: number;
}

export function saveRememberSession(email: string): void {
  const payload: RememberSession = {
    email: email.trim(),
    remember: true,
    expiresAt: Date.now() + THIRTY_DAYS_MS,
    savedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearRememberSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getRememberSession(): RememberSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as RememberSession;
    if (!parsed.remember || parsed.expiresAt < Date.now()) {
      clearRememberSession();
      return null;
    }

    return parsed;
  } catch {
    clearRememberSession();
    return null;
  }
}

export function isRememberSessionValid(): boolean {
  return getRememberSession() !== null;
}
