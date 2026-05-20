import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_MARKUP_PERCENT } from "../lib/markupStorage";
import { subscribeCatalogConfig, type CatalogConfig } from "../lib/catalogStore";
import type { Brand } from "../types";

interface PublicCatalogContextValue {
  brands: Brand[];
  markupPercent: number;
  loading: boolean;
  error: string | null;
}

const PublicCatalogContext = createContext<PublicCatalogContextValue | null>(null);

export function PublicCatalogProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CatalogConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeCatalogConfig(
      (data) => {
        setConfig(data);
        setLoading(false);
        setError(null);
      },
      (message) => {
        setError(message || null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      brands: config?.brands ?? [],
      markupPercent: config?.markupPublico ?? DEFAULT_MARKUP_PERCENT,
      loading,
      error,
    }),
    [config, loading, error]
  );

  return (
    <PublicCatalogContext.Provider value={value}>
      {children}
    </PublicCatalogContext.Provider>
  );
}

export function usePublicCatalog() {
  const ctx = useContext(PublicCatalogContext);
  if (!ctx) {
    throw new Error("usePublicCatalog deve ser usado dentro de PublicCatalogProvider");
  }
  return ctx;
}
