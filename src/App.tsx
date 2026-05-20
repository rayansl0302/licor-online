import { useCallback, useEffect, useState } from "react";
import { OrdersPanel } from "./components/OrdersPanel";
import { isSecretRoute, redirectToSecretRoute } from "./config/access";
import { useAuth } from "./contexts/AuthContext";
import { AppLayout } from "./layouts/AppLayout";
import {
  cancelOrder,
  reopenOrder,
  subscribeOrders,
  toggleOrderDone,
} from "./lib/orders";
import { isOrderPending } from "./utils/orderStatus";
import { LoginPage } from "./pages/LoginPage";
import { NovoPedidoPage } from "./pages/NovoPedidoPage";
import { ResumoPage } from "./pages/ResumoPage";
import type { AppView, Order, OrderStatus } from "./types";
import "./App.css";

export function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [view, setView] = useState<AppView>("novo");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("todos");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const onSecretRoute = isSecretRoute(pathname);
  const pendingCount = orders.filter(isOrderPending).length;

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!isSecretRoute(pathname)) {
      redirectToSecretRoute();
    }
  }, [pathname]);

  useEffect(() => {
    if (!user || !onSecretRoute) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    let active = true;
    setOrdersLoading(true);

    const unsubscribe = subscribeOrders(
      (data) => {
        if (!active) return;
        setOrders(data);
        setOrdersLoading(false);
      },
      (message) => {
        if (!active) return;
        setOrdersError(message || null);
        setOrdersLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user, onSecretRoute]);

  const handleSaved = useCallback((message: string) => {
    setSaveMessage(message);
    setOrderStatus("todos");
    setView("pedidos");
  }, []);

  const handleGoToPedidos = useCallback(() => {
    setView("pedidos");
  }, []);

  const handleToggleDone = useCallback(async (id: string, concluido: boolean) => {
    try {
      await toggleOrderDone(id, concluido);
    } catch {
      setOrdersError("Não foi possível atualizar o pedido.");
    }
  }, []);

  const handleCancel = useCallback(async (id: string) => {
    if (!window.confirm("Cancelar este pedido?")) return;
    try {
      await cancelOrder(id);
    } catch {
      setOrdersError("Não foi possível cancelar o pedido.");
    }
  }, []);

  const handleReopen = useCallback(async (id: string) => {
    try {
      await reopenOrder(id);
    } catch {
      setOrdersError("Não foi possível reativar o pedido.");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setView("novo");
    setSaveMessage(null);
  }, [logout]);

  if (!onSecretRoute) {
    return (
      <div className="auth-loading">
        <p>Redirecionando…</p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="auth-loading">
        <p>Carregando…</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout
      view={view}
      onViewChange={setView}
      userEmail={user.email ?? "Usuário"}
      pendingCount={pendingCount}
      onLogout={handleLogout}
    >
      {ordersError && (
        <p className="alert alert--warn app-banner" role="status">
          {ordersError}
        </p>
      )}

      {saveMessage && view === "pedidos" && (
        <p className="alert alert--success" role="status">
          {saveMessage}
        </p>
      )}

      <div className={view === "novo" ? "" : "view-hidden"}>
        <NovoPedidoPage
          onSaved={handleSaved}
          onGoToPedidos={handleGoToPedidos}
        />
      </div>

      <div className={view === "pedidos" ? "" : "view-hidden"}>
        <OrdersPanel
          orders={orders}
          status={orderStatus}
          loading={ordersLoading}
          onStatusChange={setOrderStatus}
          onToggleDone={handleToggleDone}
          onCancel={handleCancel}
          onReopen={handleReopen}
        />
      </div>

      {view === "resumo" && (
        <ResumoPage orders={orders} loading={ordersLoading} />
      )}
    </AppLayout>
  );
}
