// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer"; // ← Add this import

// Custom plugin to remove console.log and console.warn
const removeConsolePlugin = () => {
  return {
    name: "remove-console",
    transform(code: string, id: string) {
      // Only process your source code (skip node_modules)
      if (!id.includes("node_modules")) {
        return code
          .replace(/console\.log\(.*\);?/g, "")
          .replace(/console\.warn\(.*\);?/g, "");
      }
      return code;
    },
  };
};

// Vite configuration
export default defineConfig({
  server: {
    host: "0.0.0.0", // force IPv4 + LAN
    port: 5173,
    strictPort: true,
  },

  plugins: [
    react(),
    // Only run removeConsolePlugin in production builds
    process.env.NODE_ENV === "production" ? removeConsolePlugin() : undefined,
    visualizer({
      // ← Add this plugin
      filename: "dist/stats.html",
      open: true,
    }),
  ].filter(Boolean), // Remove undefined
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          webrtc: ["livekit-client"],
          animations: ["framer-motion"],
          "drag-drop": [
            "@dnd-kit/core",
            "@dnd-kit/sortable",
            "@dnd-kit/modifiers",
          ],
          networking: ["axios", "socket.io-client"],
          i18n: [
            "i18next",
            "i18next-browser-languagedetector",
            "react-i18next",
          ],
          ui: ["@radix-ui/react-switch", "react-toastify", "react-spinners"],
          utils: ["uuid", "zustand"],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
