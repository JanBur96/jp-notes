import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  base: mode === 'demo' ? '/jp-notes/' : '/',
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
      },
    },
  },
}));
