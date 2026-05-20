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

interface PixContextValue {
  pixKey: string;
  pixBank: string;
  pixHolderName: string;
  hasPixInfo: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  savePix: (settings: PixSettings) => Promise<void>;
}

const PixContext = createContext<PixContextValue | null>(null);

export function PixProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pix, setPix] = useState<PixSettings>(EMPTY_PIX_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const migratedRef = useRef(false);

  useEffect(() => {
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

    return () => unsubscribe();
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

  const savePix = useCallback(
    async (settings: PixSettings) => {
      if (!user) return;

      setSaving(true);
      try {
        await saveUserPix(user.uid, settings);
        setPix({
          key: settings.key.trim(),
          bank: settings.bank.trim(),
          holderName: settings.holderName.trim(),
        });
        setError(null);
      } catch {
        setError("Não foi possível salvar os dados PIX.");
        throw new Error("pix-save-failed");
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      pixKey: pix.key,
      pixBank: pix.bank,
      pixHolderName: pix.holderName,
      hasPixInfo: Boolean(pix.key || pix.bank || pix.holderName),
      loading,
      saving,
      error,
      savePix,
    }),
    [pix, loading, saving, error, savePix]
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
