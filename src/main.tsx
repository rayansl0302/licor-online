import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { MarkupProvider } from "./contexts/MarkupContext";
import { PixProvider } from "./contexts/PixContext";
import "./index.css";

if ("serviceWorker" in navigator) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <MarkupProvider>
      <PixProvider>
        <App />
      </PixProvider>
    </MarkupProvider>
  </AuthProvider>
);
