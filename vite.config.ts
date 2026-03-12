import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("/react/")) return "vendor-react";
            if (id.includes("wouter")) return "vendor-router";
            if (id.includes("@tanstack/react-query")) return "vendor-query";
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory")) return "vendor-charts";
            if (id.includes("@hookform") || id.includes("react-hook-form") || id.includes("/zod/")) return "vendor-forms";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("drizzle-zod") || id.includes("drizzle-orm")) return "vendor-db";
            return "vendor-misc";
          }
          if (id.includes("/pages/admin/")) return "pages-admin";
          if (id.includes("/pages/portfolio-")) return "pages-portfolio";
          if (id.includes("/pages/service-")) return "pages-services";
          if (id.includes("/pages/episkevi-") || id.includes("/pages/iphone-repair") || id.includes("/pages/samsung-repair") || id.includes("/pages/xiaomi-repair") || id.includes("/pages/huawei-repair") || id.includes("/pages/oneplus-repair") || id.includes("/pages/laptop-repair") || id.includes("/pages/tablet-repair") || id.includes("/pages/desktop-repair")) return "pages-repair-detail";
          if (id.includes("/pages/eshop") || id.includes("/pages/product-detail") || id.includes("/pages/checkout")) return "pages-shop";
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
