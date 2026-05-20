import { PublicCatalogProvider } from "./contexts/PublicCatalogContext";
import { isPublicOrderRoute } from "./config/access";
import { App } from "./App";
import { PublicOrderPage } from "./pages/PublicOrderPage";

export function RootApp() {
  const pathname = window.location.pathname;

  if (isPublicOrderRoute(pathname)) {
    return (
      <PublicCatalogProvider>
        <PublicOrderPage />
      </PublicCatalogProvider>
    );
  }

  return <App />;
}
