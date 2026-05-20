import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { clearLegacyPixStorage, EMPTY_PIX_SETTINGS } from "../lib/pixStorage";
import {
  migrateLegacyPixToUser,
  saveUserPix,
  subscribeUserPix,
  type PixSettings,
} from "../lib/userPix";

const SAVE_DEBOUNCE_MS = 600;

interface PixContextValue {
  pixKey: string;
  pixBank: string;
  pixHolderName: string;
  setPixKey: (key: string) => void;
  setPixBank: (bank: string) => void;
  setPixHolderName: (name: string) => void;
  hasPixInfo: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const PixContext = createContext<PixContextValue | null>(null);

export function PixProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pix, setPix] = useState<PixSettings>(EMPTY_PIX_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const migratedRef = useRef(false);

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (!user) {
      setPix(EMPTY_PIX_SETTINGS);
      setLoading(false);
      setSaving(false);
      setError(null);
      migratedRef.current = false;
      return;
    }

    setLoading(true);
    migratedRef.current = false;

    const unsubscribe = subscribeUserPix(
      user.uid,
      (settings) => {
        setPix(settings);
        setLoading(false);
      },
      (message) => {
        setError(message || null);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user || loading || migratedRef.current) return;

    const isEmpty = !pix.key && !pix.bank && !pix.holderName;
    if (!isEmpty) {
      migratedRef.current = true;
      return;
    }

    migratedRef.current = true;

    migrateLegacyPixToUser(user.uid)
      .then((legacy) => {
        if (legacy.key || legacy.bank || legacy.holderName) {
          setPix(legacy);
          clearLegacyPixStorage();
        }
      })
      .catch(() => {
        migratedRef.current = false;
      });
  }, [user, loading, pix.key, pix.bank, pix.holderName]);

  const scheduleSave = useCallback(
    (next: PixSettings) => {
      if (!user) return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(() => {
        setSaving(true);
        saveUserPix(user.uid, next)
          .then(() => setError(null))
          .catch(() => setError("Não foi possível salvar os dados PIX."))
          .finally(() => setSaving(false));
      }, SAVE_DEBOUNCE_MS);
    },
    [user]
  );

  const updatePix = useCallback(
    (patch: Partial<PixSettings>) => {
      setPix((prev) => {
        const next: PixSettings = {
          key: patch.key !== undefined ? patch.key.trim() : prev.key,
          bank: patch.bank !== undefined ? patch.bank.trim() : prev.bank,
          holderName:
            patch.holderName !== undefined
              ? patch.holderName.trim()
              : prev.holderName,
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const setPixKey = useCallback((key: string) => updatePix({ key }), [updatePix]);
  const setPixBank = useCallback((bank: string) => updatePix({ bank }), [updatePix]);
  const setPixHolderName = useCallback(
    (holderName: string) => updatePix({ holderName }),
    [updatePix]
  );

  const value = useMemo(
    () => ({
      pixKey: pix.key,
      pixBank: pix.bank,
      pixHolderName: pix.holderName,
      setPixKey,
      setPixBank,
      setPixHolderName,
      hasPixInfo: Boolean(pix.key || pix.bank || pix.holderName),
      loading,
      saving,
      error,
    }),
    [pix, setPixKey, setPixBank, setPixHolderName, loading, saving, error]
  );

  return <PixContext.Provider value={value}>{children}</PixContext.Provider>;
}

export function usePix() {
  const ctx = useContext(PixContext);
  if (!ctx) {
    throw new Error("usePix deve ser usado dentro de PixProvider");
  }
  return ctx;
}
