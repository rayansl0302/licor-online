import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { DEFAULT_BRANDS } from "../data/defaultBrands";
import { cloneBrands } from "../data/brands";
import { db } from "./firebase";
import { getFirestoreErrorMessage } from "./firestoreErrors";
import type { Brand } from "../types";

const DOC_PATH = ["config", "catalogo"] as const;

interface CatalogFirestore {
  brands?: Brand[];
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
  const ref = doc(db, DOC_PATH[0], DOC_PATH[1]);

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(cloneBrands(DEFAULT_BRANDS));
        onError("");
        return;
      }

      const data = snapshot.data() as CatalogFirestore;
      onData(normalizeBrands(data.brands));
      onError("");
    },
    (err) => {
      onError(getFirestoreErrorMessage(err));
      onData(cloneBrands(DEFAULT_BRANDS));
    }
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
