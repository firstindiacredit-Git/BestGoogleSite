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
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/images\.pexels\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "pexels-images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    // Generate smaller chunks with better splitting
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunks
          "react-vendor": ["react", "react-dom"],
          "router-vendor": ["react-router-dom"],

          // Firebase chunks
          "firebase-core": ["firebase/app"],
          "firebase-auth": ["firebase/auth"],
          "firebase-firestore": ["firebase/firestore"],
          "firebase-storage": ["firebase/storage"],

          // UI Library chunks
          "antd-vendor": ["antd"],
          "mui-vendor": ["@mui/material", "@mui/icons-material"],
          "icons-vendor": [
            "react-icons",
            "@tabler/icons-react",
            "lucide-react",
          ],

          // PDF and Document processing
          "pdf-vendor": ["pdfjs-dist", "pdf-lib", "pdfmake", "jspdf"],

          // Image processing
          "image-vendor": [
            "html2canvas",
            "browser-image-compression",
            "react-easy-crop",
          ],

          // Animation libraries
          "animation-vendor": ["framer-motion", "gsap", "aos"],

          // Utility libraries
          "utils-vendor": ["axios", "crypto-js", "date-fns", "moment-timezone"],

          // Chart and data visualization
          "chart-vendor": ["chart.js", "react-chartjs-2"],

          // Tools specific chunks
          "tools-vendor": ["exceljs", "xlsx", "mammoth", "docx-preview"],
        },
      },
    },
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,

    // Advanced minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },

    // Disable sourcemaps in production
    sourcemap: false,

    // Optimize assets
    assetsInlineLimit: 4096,

    // Target modern browsers for smaller bundles
    target: "es2020",
  },

  // Optimize development server
  server: {
    hmr: true,
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "antd",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
      ],
      exclude: ["@swc/core"],
    },
    preTransformRequests: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "antd",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
    ],
    exclude: ["@swc/core"],
  },

  // Path resolution
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  // Performance optimizations
  esbuild: {
    target: "es2020",
    treeShaking: true,
  },
});
