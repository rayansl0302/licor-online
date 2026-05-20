import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { DEFAULT_BRANDS } from "../data/defaultBrands";
import { cloneBrands } from "../data/brands";
import { DEFAULT_MARKUP_PERCENT } from "../lib/markupStorage";
import { db } from "./firebase";
import { getFirestoreErrorMessage } from "./firestoreErrors";
import type { Brand } from "../types";

const DOC_PATH = ["config", "catalogo"] as const;

export interface CatalogConfig {
  brands: Brand[];
  markupPublico: number;
}

interface CatalogFirestore {
  brands?: Brand[];
  markupPublico?: number;
}

function normalizeMarkupPublico(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_MARKUP_PERCENT;
  }
  return Math.min(200, Math.max(0, Math.round(value)));
}

function mapCatalogConfig(data: CatalogFirestore | undefined): CatalogConfig {
  return {
    brands: normalizeBrands(data?.brands),
    markupPublico: normalizeMarkupPublico(data?.markupPublico),
  };
}

function normalizeBrands(value: unknown): Brand[] {
  if (!Array.isArray(value)) return cloneBrands(DEFAULT_BRANDS);

  const brands = value as Brand[];
  if (brands.length === 0) return cloneBrands(DEFAULT_BRANDS);

  return cloneBrands(brands);
}

export function subscribeCatalog(
  onData: (brands: Brand[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  return subscribeCatalogConfig(
    (config) => onData(config.brands),
    onError
  );
}

export function subscribeCatalogConfig(
  onData: (config: CatalogConfig) => void,
  onError: (message: string) => void
): Unsubscribe {
  const ref = doc(db, DOC_PATH[0], DOC_PATH[1]);

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData({
          brands: cloneBrands(DEFAULT_BRANDS),
          markupPublico: DEFAULT_MARKUP_PERCENT,
        });
        onError("");
        return;
      }

      const data = snapshot.data() as CatalogFirestore;
      onData(mapCatalogConfig(data));
      onError("");
    },
    (err) => {
      onError(getFirestoreErrorMessage(err));
      onData({
        brands: cloneBrands(DEFAULT_BRANDS),
        markupPublico: DEFAULT_MARKUP_PERCENT,
      });
    }
  );
}

export async function saveMarkupPublico(markupPublico: number): Promise<void> {
  const ref = doc(db, DOC_PATH[0], DOC_PATH[1]);
  const value = normalizeMarkupPublico(markupPublico);

  await setDoc(
    ref,
    {
      markupPublico: value,
      atualizadoEm: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveCatalog(brands: Brand[]): Promise<void> {
  const ref = doc(db, DOC_PATH[0], DOC_PATH[1]);

  await setDoc(
    ref,
    {
      brands: cloneBrands(brands),
      atualizadoEm: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function seedCatalogIfEmpty(brands: Brand[]): Promise<void> {
  const isEmpty = brands.every((brand) =>
    brand.categorias.every((cat) => cat.produtos.length === 0)
  );

  if (!isEmpty) return;

  await saveCatalog(DEFAULT_BRANDS);
}
