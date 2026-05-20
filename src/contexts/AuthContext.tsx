import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { ADMIN_ACCESS_DENIED_MESSAGE, isAdminUser } from "../lib/admin";
import {
  ensureAuthPersistence,
  loginWithEmail,
  logout,
  subscribeAuth,
} from "../lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  accessDenied: string | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearAccessDenied: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    ensureAuthPersistence().then(() => {
      unsubscribe = subscribeAuth(async (nextUser) => {
        if (nextUser && !isAdminUser(nextUser)) {
          await logout();
          setUser(null);
          setAccessDenied(ADMIN_ACCESS_DENIED_MESSAGE);
        } else {
          setUser(nextUser);
          if (nextUser) setAccessDenied(null);
        }
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const credential = await loginWithEmail(email, password, remember);
      if (!isAdminUser(credential.user)) {
        await logout();
        setAccessDenied(ADMIN_ACCESS_DENIED_MESSAGE);
        throw { code: "auth/admin-required" };
      }
      setAccessDenied(null);
    },
    []
  );

  const clearAccessDenied = useCallback(() => setAccessDenied(null), []);

  const logoutUser = useCallback(async () => {
    await logout();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      accessDenied,
      login,
      logout: logoutUser,
      clearAccessDenied,
    }),
    [user, loading, accessDenied, login, logoutUser, clearAccessDenied]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
