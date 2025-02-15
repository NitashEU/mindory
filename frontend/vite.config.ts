import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  root: ".",
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: "dist",
    target: "esnext",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
