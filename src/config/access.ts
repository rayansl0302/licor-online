/** Rota oculta — não divulgue. Acesse: https://seu-dominio/licor-rayan-painel */
export const SECRET_APP_PATH = "/licor-rayan-painel";

/** Rota pública — envie o link para o cliente montar o pedido */
export const PUBLIC_ORDER_PATH = "/pedir";

const RAYAN_PATTERN = /rayan/i;

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

export function isSecretRoute(pathname: string): boolean {
  return normalizePath(pathname) === SECRET_APP_PATH;
}

export function isPublicOrderRoute(pathname: string): boolean {
  return normalizePath(pathname) === PUBLIC_ORDER_PATH;
}

export function isKnownAppRoute(pathname: string): boolean {
  return isSecretRoute(pathname) || isPublicOrderRoute(pathname);
}

export function getPublicOrderUrl(origin = window.location.origin): string {
  return `${origin}${PUBLIC_ORDER_PATH}`;
}

export function redirectToSecretRoute(): void {
  if (isKnownAppRoute(window.location.pathname)) return;
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
