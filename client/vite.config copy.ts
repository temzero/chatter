// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
  plugins: [
    react(),
    // Only run removeConsolePlugin in production builds
    process.env.NODE_ENV === "production" ? removeConsolePlugin() : undefined,
  ].filter(Boolean), // Remove undefined
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
});
