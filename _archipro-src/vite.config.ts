import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imageEditor } from "./dev/imageEditorPlugin.js";

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Warns on every build while content.md still has [copy to add], so it is not published by accident.
function contentPlaceholders() {
  return {
    name: "archipro-content-placeholders",
    apply: "build" as const,
    buildStart(this: { warn: (message: string) => void }) {
      const found = readFileSync(page("./content.md"), "utf8").match(/\[[^\]]+\]/g) ?? [];
      if (found.length > 0) this.warn(`content.md still has ${found.length} placeholders to fill: ${found.join(" ")}`);
    },
  };
}

export default defineConfig({
  base: "/archipro/",
  plugins: [react(), imageEditor(), contentPlaceholders()],
  build: {
    // The built site is committed and served by GitHub Pages from ../archipro.
    outDir: "../archipro",
    emptyOutDir: true,
    rollupOptions: {
      // Two pages, no router.
      input: {
        site: page("./index.html"),
        prototype: page("./prototype/index.html"),
      },
      // Jekyll drops files whose names start with "_", so every output name gets a letter prefix.
      output: {
        entryFileNames: "assets/e-[hash].js",
        chunkFileNames: "assets/c-[hash].js",
        assetFileNames: "assets/a-[hash][extname]",
      },
    },
  },
});
