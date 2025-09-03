import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

/// <reference types="vitest" />

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  server: {
    port: parseInt(process.env.VITE_PORT, 10) || 3000,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist/client",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./client/src/test-setup.ts"],
    include: ["client/**/*.{test,spec}.{ts,tsx}"],
  },
});
