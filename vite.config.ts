import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure the base path is correct for GitHub Pages if not using a custom domain.
  // If hosted at https://username.github.io/repo-name/, it should be '/repo-name/'.
  // Leaving it as '/' works for custom domains or username.github.io.
  // base: process.env.NODE_ENV === 'production' ? '/Showcase_website/' : '/',
});
