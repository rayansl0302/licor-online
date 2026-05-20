import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { app } from "./firebase";
import {
  clearRememberSession,
  getRememberSession,
  isRememberSessionValid,
  saveRememberSession,
} from "./rememberLogin";

export const auth = getAuth(app);

let persistenceReady: Promise<void> | null = null;

export function ensureAuthPersistence(): Promise<void> {
  if (!persistenceReady) {
    persistenceReady = setPersistence(
      auth,
      isRememberSessionValid() ? browserLocalPersistence : browserSessionPersistence
    ).catch(() => undefined);
  }
  return persistenceReady;
}

export function subscribeAuth(onUser: (user: User | null) => void) {
  return onAuthStateChanged(auth, onUser);
}

export async function loginWithEmail(
  email: string,
  password: string,
  remember: boolean
) {
  await setPersistence(
    auth,
    remember ? browserLocalPersistence : browserSessionPersistence
  );

  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  if (remember) {
    saveRememberSession(email);
  } else {
    clearRememberSession();
  }

  return credential;
}

export async function logout() {
  clearRememberSession();
  return signOut(auth);
}

export function getSavedLoginEmail(): string {
  return getRememberSession()?.email ?? "";
}
