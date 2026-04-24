import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    svelte(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "apple-touch-icon-180x180.png",
      ],
      manifest: {
        name: "JPNotes",
        short_name: "JPNotes",
        description: "A focused notes app with folders, wikilinks, and AI summaries.",
        theme_color: "#0a1220",
        background_color: "#0a1220",
        display: "standalone",
        start_url: ".",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === "GET" && /\/api\/(notes|folders)/.test(url.pathname),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "jp-notes-api",
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],
  base: mode === "demo" ? "/jp-notes/" : "/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
      },
    },
  },
}));
