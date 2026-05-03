import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  root: resolve(__dirname, "examples/integrated"),
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "dist-example"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "examples/integrated/index.html"),
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("@codemirror/") || id.includes("@lezer/")) {
            return "vendor-codemirror";
          }

          if (id.includes("react-markdown") || id.includes("unified") || id.includes("remark-") || id.includes("mdast-") || id.includes("micromark")) {
            return "vendor-markdown";
          }

          if (id.includes("jspdf")) {
            return "vendor-jspdf";
          }

          if (id.includes("html2canvas")) {
            return "vendor-html2canvas";
          }

          if (id.includes("dompurify")) {
            return "vendor-dompurify";
          }

          if (id.includes("yaml") || id.includes("zod")) {
            return "vendor-parsing";
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "vendor-react";
          }

          return "vendor";
        },
      },
    },
  },
});
