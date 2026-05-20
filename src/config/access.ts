/** Rota oculta — não divulgue. Acesse: https://seu-dominio/licor-rayan-painel */
export const SECRET_APP_PATH = "/licor-rayan-painel";

const RAYAN_PATTERN = /rayan/i;

export function isSecretRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return normalized === SECRET_APP_PATH;
}

export function redirectToSecretRoute(): void {
  if (isSecretRoute(window.location.pathname)) return;
  window.location.replace(SECRET_APP_PATH);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return RAYAN_PATTERN.test(email);
}

export function isAdminDisplayName(name: string | null | undefined): boolean {
  if (!name) return false;
  return RAYAN_PATTERN.test(name);
}
