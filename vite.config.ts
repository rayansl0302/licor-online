import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { SECRET_APP_PATH } from "./src/config/access";

const appScope = `${SECRET_APP_PATH}/`;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon.png", "pwa-192.png", "pwa-512.png"],
      manifest: {
        id: appScope,
        name: "Licor — Pedidos",
        short_name: "Licor",
        description: "Gestão rápida de pedidos de licores",
        theme_color: "#0f1419",
        background_color: "#0f1419",
        display: "standalone",
        orientation: "portrait",
        scope: appScope,
        start_url: appScope,
        lang: "pt-BR",
        categories: ["business", "productivity"],
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [new RegExp(`^${SECRET_APP_PATH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)],
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: true,
        navigateFallback: "/index.html",
      },
    }),
  ],
});
