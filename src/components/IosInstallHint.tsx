import { useEffect, useState } from "react";
import "./IosInstallHint.css";

const DISMISS_KEY = "licor-ios-install-hint-dismissed";

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

export function IosInstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIosDevice() || isStandaloneDisplay()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <aside className="ios-install-hint" role="note" aria-label="Instalar no iPhone">
      <p className="ios-install-hint__title">Adicionar à Tela de Início</p>
      <p className="ios-install-hint__text">
        No Safari: toque em <strong>Compartilhar</strong> e depois em{" "}
        <strong>Adicionar à Tela de Início</strong> para abrir como app.
      </p>
      <button
        type="button"
        className="ios-install-hint__close"
        onClick={dismiss}
        aria-label="Fechar dica"
      >
        ✕
      </button>
    </aside>
  );
}
