import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { getFirestoreErrorMessage } from "./firestoreErrors";
import {
  EMPTY_PIX_SETTINGS,
  loadLegacyPixSettings,
  normalizePixSettings,
  type PixSettings,
} from "./pixStorage";

export type { PixSettings } from "./pixStorage";

const COLLECTION = "usuarios";

interface UserPixFirestore {
  pix?: PixSettings;
  atualizadoEm?: ReturnType<typeof serverTimestamp>;
}

export function subscribeUserPix(
  userId: string,
  onData: (settings: PixSettings) => void,
  onError: (message: string) => void
): Unsubscribe {
  const ref = doc(db, COLLECTION, userId);

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(EMPTY_PIX_SETTINGS);
        onError("");
        return;
      }

      const data = snapshot.data() as UserPixFirestore;
      onData(normalizePixSettings(data.pix ?? data));
      onError("");
    },
    (err) => {
      onError(getFirestoreErrorMessage(err));
      onData(EMPTY_PIX_SETTINGS);
    }
  );
}

export async function saveUserPix(
  userId: string,
  settings: PixSettings
): Promise<void> {
  const pix = normalizePixSettings(settings);

  await setDoc(
    doc(db, COLLECTION, userId),
    {
      pix,
      atualizadoEm: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function migrateLegacyPixToUser(userId: string): Promise<PixSettings> {
  const legacy = loadLegacyPixSettings();
  const hasLegacy = Boolean(legacy.key || legacy.bank || legacy.holderName);

  if (!hasLegacy) return EMPTY_PIX_SETTINGS;

  await saveUserPix(userId, legacy);
  return legacy;
}
