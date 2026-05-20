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
import { cloneBrands } from "../data/brands";
import { DEFAULT_BRANDS } from "../data/defaultBrands";
import {
  saveCatalog,
  seedCatalogIfEmpty,
  subscribeCatalog,
} from "../lib/catalogStore";
import type { Brand, BrandId } from "../types";
import {
  addCatalogProduct,
  removeCatalogProduct,
  updateCatalogProduct,
} from "../utils/catalogMutations";
import { useAuth } from "./AuthContext";

interface CatalogContextValue {
  brands: Brand[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  addProduct: (
    brandId: BrandId,
    categoria: string,
    nome: string,
    preco: number
  ) => Promise<void>;
  removeProduct: (
    brandId: BrandId,
    categoria: string,
    productId: string
  ) => Promise<void>;
  updateProduct: (
    brandId: BrandId,
    categoria: string,
    productId: string,
    patch: { nome?: string; preco?: number }
  ) => Promise<void>;
  importCatalog: (brands: Brand[]) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>(() => cloneBrands(DEFAULT_BRANDS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seededRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setBrands(cloneBrands(DEFAULT_BRANDS));
      setLoading(false);
      setSaving(false);
      setError(null);
      seededRef.current = false;
      return;
    }

    setLoading(true);
    seededRef.current = false;

    const unsubscribe = subscribeCatalog(
      (data) => {
        setBrands(data);
        setLoading(false);

        if (!seededRef.current) {
          seededRef.current = true;
          const empty = data.every((brand) =>
            brand.categorias.every((cat) => cat.produtos.length === 0)
          );
          if (empty) {
            seedCatalogIfEmpty(data).catch(() => {
              setError("Não foi possível inicializar o catálogo.");
            });
          }
        }
      },
      (message) => {
        setError(message || null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const persist = useCallback(async (next: Brand[]) => {
    setSaving(true);
    try {
      await saveCatalog(next);
      setBrands(next);
      setError(null);
    } catch {
      setError("Não foi possível salvar o catálogo.");
      throw new Error("catalog-save-failed");
    } finally {
      setSaving(false);
    }
  }, []);

  const addProduct = useCallback(
    async (
      brandId: BrandId,
      categoria: string,
      nome: string,
      preco: number
    ) => {
      const next = addCatalogProduct(brands, brandId, categoria, nome, preco);
      await persist(next);
    },
    [brands, persist]
  );

  const removeProduct = useCallback(
    async (brandId: BrandId, categoria: string, productId: string) => {
      const next = removeCatalogProduct(brands, brandId, categoria, productId);
      await persist(next);
    },
    [brands, persist]
  );

  const updateProduct = useCallback(
    async (
      brandId: BrandId,
      categoria: string,
      productId: string,
      patch: { nome?: string; preco?: number }
    ) => {
      const next = updateCatalogProduct(
        brands,
        brandId,
        categoria,
        productId,
        patch
      );
      await persist(next);
    },
    [brands, persist]
  );

  const importCatalog = useCallback(
    async (nextBrands: Brand[]) => {
      await persist(cloneBrands(nextBrands));
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      brands,
      loading,
      saving,
      error,
      addProduct,
      removeProduct,
      updateProduct,
      importCatalog,
    }),
    [
      brands,
      loading,
      saving,
      error,
      addProduct,
      removeProduct,
      updateProduct,
      importCatalog,
    ]
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog deve ser usado dentro de CatalogProvider");
  }
  return ctx;
}
