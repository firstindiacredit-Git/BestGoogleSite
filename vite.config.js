import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "All My Tabs",
        short_name: "AllMyTabs",
        description: "A modern Chrome homepage replacement",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  build: {
    // Generate smaller chunks
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "firebase-vendor": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
          ],
          "ui-vendor": ["antd"],
        },
      },
    },
    // Reduce CSS file size
    cssCodeSplit: true,
    // Minify everything
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable sourcemaps for production
    sourcemap: false,
  },
  // Optimize server during development
  server: {
    // Enable HMR
    hmr: true,
    // Pre-bundling
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "antd"],
    },
  },
  // Reduce bundle size
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
