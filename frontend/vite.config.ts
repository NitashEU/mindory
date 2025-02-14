import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    // Enable modern build output
    target: "esnext",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
