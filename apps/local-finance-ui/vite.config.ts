import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import type { Plugin } from "vite";

// Force preload to compile as CJS.
// vite-plugin-electron reads "type":"module" from package.json and sets
// build.lib.formats to ["es"]. Vite's mergeConfig concatenates arrays,
// so setting formats in user config produces ["es","cjs"]. This plugin
// runs AFTER mergeConfig and overrides to CJS only.
function forceCjs(): Plugin {
  return {
    name: "force-preload-cjs",
    config(config) {
      if (config.build?.lib && typeof config.build.lib === "object") {
        (config.build.lib as { formats: string[] }).formats = ["cjs"];
      }
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    electron([
      {
        entry: "electron/main.ts",
        vite: {
          build: {
            outDir: "dist-electron",
            rollupOptions: {
              external: ["better-sqlite3"],
            },
          },
        },
      },
      {
        entry: "electron/preload.ts",
        vite: {
          plugins: [forceCjs()],
          build: {
            outDir: "dist-electron",
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
