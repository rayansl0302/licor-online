export function getFirestoreErrorMessage(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: string }).code)
      : "";

  const message =
    err instanceof Error ? err.message : "";

  if (message.includes("INTERNAL ASSERTION FAILED")) {
    return "Erro interno do Firestore. Recarregue a página (F5). Confirme que o banco foi criado no Firebase Console.";
  }

  if (code === "auth/user-not-signed-in") {
    return "Faça login para salvar pedidos.";
  }

  if (code === "auth/admin-required") {
    return "Acesso negado. Apenas o administrador Rayan pode entrar.";
  }

  if (code === "permission-denied") {
    return "Sem permissão no Firestore. Faça login e publique as regras com autenticação no Firebase Console.";
  }

  if (code === "not-found" || code === "unavailable") {
    return "Firestore não encontrado. Firebase Console → Build → Firestore Database → Criar banco.";
  }

  if (code === "failed-precondition") {
    return "Índice do Firestore pendente. Aguarde alguns minutos ou recarregue a página.";
  }

  if (message) {
    return `Firestore: ${message}`;
  }

  return "Não foi possível conectar ao Firestore. Crie o banco e publique as regras no Firebase Console.";
}
