import { useState, type ReactNode } from "react";
import { useMarkup } from "../contexts/MarkupContext";
import { formatMarkupLabel } from "../utils/pricing";
import type { AppView } from "../types";
import "./AppLayout.css";

interface NavItem {
  id: AppView;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "novo", label: "Novo pedido", icon: "+" },
  { id: "catalogo", label: "Catálogo", icon: "◎" },
  { id: "pedidos", label: "Histórico", icon: "☰" },
  { id: "resumo", label: "Resumo", icon: "◈" },
];

interface AppLayoutProps {
  view: AppView;
  onViewChange: (view: AppView) => void;
  userEmail: string;
  pendingCount: number;
  onLogout: () => void;
  children: ReactNode;
}

export function AppLayout({
  view,
  onViewChange,
  userEmail,
  pendingCount,
  onLogout,
  children,
}: AppLayoutProps) {
  const { markupPercent } = useMarkup();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNav = (next: AppView) => {
    onViewChange(next);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <button
        type="button"
        className="sidebar-toggle"
        aria-label="Abrir menu"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}
        aria-label="Menu principal"
      >
        <div className="sidebar__brand">
          <span className="sidebar__logo">Licor</span>
          <span className="sidebar__tag">Pedidos</span>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar__link ${view === item.id ? "sidebar__link--active" : ""}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="sidebar__icon" aria-hidden>
                {item.icon}
              </span>
              {item.label}
              {item.id === "pedidos" && pendingCount > 0 && (
                <span className="sidebar__badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__user" title={userEmail}>
            {userEmail}
          </p>
          <button
            type="button"
            className="btn btn--secondary btn--small sidebar__logout"
            onClick={onLogout}
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="app-shell__main">
        <header className="topbar">
          <h1 className="topbar__title">
            {NAV_ITEMS.find((i) => i.id === view)?.label ?? "Licor"}
          </h1>
          <p className="topbar__meta">
            Lucro {formatMarkupLabel(markupPercent)} · histórico na nuvem
          </p>
        </header>
        <div className="app-shell__content">{children}</div>
      </div>
    </div>
  );
}
