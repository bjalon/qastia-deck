import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "DeckRuntime",
      fileName: "deck-runtime",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-markdown",
        "yaml",
        "zod",
        "@codemirror/lang-yaml",
        "@codemirror/state",
        "@codemirror/view",
        "@hookform/resolvers",
        "react-hook-form",
        "unified",
      ],
    },
  },
});
