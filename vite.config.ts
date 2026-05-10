import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        "deck-runtime": resolve(__dirname, "src/index.ts"),
        viewer: resolve(__dirname, "src/viewer.ts"),
        editor: resolve(__dirname, "src/editor.ts"),
        presentation: resolve(__dirname, "src/presentation.ts"),
        compiler: resolve(__dirname, "src/compiler.ts"),
        gitlight: resolve(__dirname, "src/gitlight.ts"),
        runtime: resolve(__dirname, "src/runtime.ts"),
        pdf: resolve(__dirname, "src/pdf.ts"),
      },
      name: "DeckRuntime",
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: "deck-runtime",
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
        "html2canvas",
        "jspdf",
        "mermaid",
        "react-hook-form",
        "shiki",
        "unified",
        "@bjalon/object-vcs-core",
      ],
    },
  },
});
