import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSavedLoginEmail } from "../lib/auth";
import { isRememberSessionValid } from "../lib/rememberLogin";
import { ADMIN_ACCESS_DENIED_MESSAGE } from "../lib/admin";
import "./LoginPage.css";

export function LoginPage() {
  const { login, accessDenied, clearAccessDenied } = useAuth();
  const [email, setEmail] = useState(() => getSavedLoginEmail());
  const [password, setPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(() =>
    isRememberSessionValid()
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessDenied) setError(accessDenied);
  }, [accessDenied]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    clearAccessDenied();

    try {
      await login(email, password, rememberLogin);
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";

      if (code === "auth/admin-required") {
        setError(ADMIN_ACCESS_DENIED_MESSAGE);
      } else if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError("E-mail ou senha incorretos.");
      } else if (code === "auth/user-not-found") {
        setError("Usuário não encontrado.");
      } else if (code === "auth/too-many-requests") {
        setError("Muitas tentativas. Aguarde e tente novamente.");
      } else {
        setError("Não foi possível entrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="login-card__eyebrow">Área restrita</p>
        <h1 className="login-card__title">Licor — Pedidos</h1>
        <p className="login-card__subtitle">Acesso somente para administrador.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">E-mail</span>
            <input
              type="email"
              className="field__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Senha</span>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                className="field__input password-field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-field__toggle"
                aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Ocultar" : "Exibir"}
              </button>
            </div>
          </label>

          <label className="remember-field">
            <input
              type="checkbox"
              className="remember-field__checkbox"
              checked={rememberLogin}
              onChange={(e) => setRememberLogin(e.target.checked)}
            />
            <span>Manter conectado por 30 dias</span>
          </label>

          {error && (
            <p className="alert alert--error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn--primary login-form__submit"
            disabled={loading}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
