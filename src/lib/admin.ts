import type { User } from "firebase/auth";
import { isAdminDisplayName, isAdminEmail } from "../config/access";

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return isAdminEmail(user.email) || isAdminDisplayName(user.displayName);
}

export const ADMIN_ACCESS_DENIED_MESSAGE =
  "Acesso negado. Apenas o administrador Rayan pode usar este sistema.";
