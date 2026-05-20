import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { MarkupProvider } from "./contexts/MarkupContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <MarkupProvider>
      <App />
    </MarkupProvider>
  </AuthProvider>
);
