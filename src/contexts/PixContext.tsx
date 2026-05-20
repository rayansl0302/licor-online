import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadPixSettings,
  savePixSettings,
  type PixSettings,
} from "../lib/pixStorage";

interface PixContextValue {
  pixKey: string;
  pixBank: string;
  pixHolderName: string;
  setPixKey: (key: string) => void;
  setPixBank: (bank: string) => void;
  setPixHolderName: (name: string) => void;
  hasPixInfo: boolean;
}

const PixContext = createContext<PixContextValue | null>(null);

export function PixProvider({ children }: { children: ReactNode }) {
  const [pix, setPix] = useState<PixSettings>(loadPixSettings);

  const updatePix = useCallback((patch: Partial<PixSettings>) => {
    setPix((prev) => {
      const next: PixSettings = {
        key: patch.key !== undefined ? patch.key.trim() : prev.key,
        bank: patch.bank !== undefined ? patch.bank.trim() : prev.bank,
        holderName:
          patch.holderName !== undefined
            ? patch.holderName.trim()
            : prev.holderName,
      };
      savePixSettings(next);
      return next;
    });
  }, []);

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
    }),
    [pix, setPixKey, setPixBank, setPixHolderName]
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
