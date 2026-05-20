import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_MARKUP_PERCENT,
  loadMarkupPercent,
  saveMarkupPercent,
} from "../lib/markupStorage";
import { saveMarkupPublico } from "../lib/catalogStore";
import { applyMarkup } from "../utils/pricing";
import { useAuth } from "./AuthContext";

interface MarkupContextValue {
  markupPercent: number;
  setMarkupPercent: (percent: number) => void;
  applyToPrice: (basePrice: number) => number;
}

const MarkupContext = createContext<MarkupContextValue | null>(null);

export function MarkupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [markupPercent, setMarkupPercentState] = useState(loadMarkupPercent);

  const setMarkupPercent = useCallback(
    (percent: number) => {
      const value = Math.min(200, Math.max(0, Math.round(percent)));
      saveMarkupPercent(value);
      setMarkupPercentState(value);

      if (user) {
        saveMarkupPublico(value).catch(() => undefined);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;
    saveMarkupPublico(markupPercent).catch(() => undefined);
  }, [user?.uid]);

  const applyToPrice = useCallback(
    (basePrice: number) => applyMarkup(basePrice, markupPercent),
    [markupPercent]
  );

  const value = useMemo(
    () => ({ markupPercent, setMarkupPercent, applyToPrice }),
    [markupPercent, setMarkupPercent, applyToPrice]
  );

  return (
    <MarkupContext.Provider value={value}>{children}</MarkupContext.Provider>
  );
}

export function useMarkup() {
  const ctx = useContext(MarkupContext);
  if (!ctx) {
    throw new Error("useMarkup deve ser usado dentro de MarkupProvider");
  }
  return ctx;
}

export { DEFAULT_MARKUP_PERCENT };
