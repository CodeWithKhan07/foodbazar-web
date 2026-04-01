import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Electron main process entry
        entry: "electron/main.js",
      },
      preload: {
        // Preload scripts are automatically compiled to .mjs
        input: "electron/preload.js",
      },
    }),
  ],
  // Required so asset paths work when loaded from the filesystem in production
  base: "./",
});
